"use server";

import prisma from "@database/prisma";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";
import { getSession } from "utils/auth/dataAccessLayer";
import { sendTelegramMessage, getTelegramGroupChatId } from "utils/telegram/botApi";
import {
    buildPaymentRequestReviewMessage,
    resolveTelegramMessageLocale,
} from "utils/telegram/paymentRequestMessages";
import { getGlobalConfigs } from "@database/config/data";
import type { GlobalConfigType } from "utils/types/configs";
import { enqueueAccount } from "@database/loan/queue";
import { recalculateMonthlyFastPayers } from "@database/gamification/fastPayer";
import { recalculateUserPunctuality } from "@database/gamification/punctuality";
import { getCalendarPeriod, DateType } from "utils/calendarPeriod";

export async function payAPayment(id: number) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id },
      include: {
        loan: {
          select: {
            account: { select: { userId: true } },
          },
        },
      },
    });

    if (!payment || payment.paidAt) {
      return {
        status: "ERROR",
        message: "The payment already has been paid",
      }
    }

    await prisma.payment.update({
      where: { id },
      data: { paidAt: new Date() }
    });

    const count = await prisma.payment.count({
      where: {
        loanId: payment.loanId,
        paidAt: null
      }
    });

    if (count === 0) {
      const finishedLoan = await prisma.loan.update({
        where: { id: payment.loanId! },
        data: { status: "FINISHED" }
      });
      if (finishedLoan.accountId) {
        await enqueueAccount(finishedLoan.accountId);
      }
      revalidatePath(`/${DASHBOARD_URL}/loans`);
    }

    const ownerUserId = payment.loan?.account?.userId;
    if (ownerUserId) {
      try {
        await recalculateUserPunctuality(ownerUserId);
      } catch (err) {
        console.error("Failed to recalculate punctuality:", err);
      }
    }

    revalidatePath(`/${DASHBOARD_URL}/payments`);
    revalidatePath("/home");
    return {
      status: "SUCCESS",
      message: "Payment paid successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to pay the payment",
    }
  }
}

export async function reviewPaymentRequest(requestId: number, status: "APPROVED" | "REJECTED") {
  const session = await getSession();
  if (!session?.userId) {
    return { status: "ERROR", message: "Unauthorized" };
  }

  try {
    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
      include: {
        installments: true,
        payments: true,
        user: true,
      },
    });

    if (!request) {
      return { status: "ERROR", message: "Payment request not found" };
    }

    if (request.status !== "PENDING") {
      return { status: "ERROR", message: `This request has already been ${request.status.toLowerCase()}` };
    }

    const adminUserId = Number(session.userId);

    if (status === "APPROVED") {
      for (const inst of request.installments) {
        if (inst.paidAt) continue;

        await prisma.installment.update({
          where: { id: inst.id },
          data: {
            paidAt: new Date(),
            approvedById: adminUserId,
            approvedAt: new Date(),
          },
        });

        const totalAmount = await prisma.installment.aggregate({
          _sum: { amount: true },
          where: {
            accountId: inst.accountId,
            paidAt: { not: null },
          },
        });

        await prisma.account.update({
          where: { id: inst.accountId! },
          data: {
            balance: Number(totalAmount._sum.amount),
          },
        });
      }

      for (const pay of request.payments) {
        if (pay.paidAt) continue;

        await prisma.payment.update({
          where: { id: pay.id },
          data: { paidAt: new Date() },
        });

        if (pay.loanId) {
          const count = await prisma.payment.count({
            where: {
              loanId: pay.loanId,
              paidAt: null,
            },
          });

          if (count === 0) {
            const finishedLoan = await prisma.loan.update({
              where: { id: pay.loanId },
              data: { status: "FINISHED" },
            });
            if (finishedLoan.accountId) {
              await enqueueAccount(finishedLoan.accountId);
            }
          }
        }
      }
      
      // GAMIFICATION: Recalculate fastest payer for the periods touched by these installments
      try {
        const globalConfig = (await getGlobalConfigs()) as GlobalConfigType;
        const dateType: DateType = globalConfig.dateType ?? "JALALI";
        
        const touchedPeriods = new Set<string>();
        for (const inst of request.installments) {
          if (inst.type === "NORMAL") {
            const period = getCalendarPeriod(inst.dueDate, dateType);
            touchedPeriods.add(`${period.year}-${period.month}`);
          }
        }
        
        for (const periodStr of touchedPeriods) {
          const [y, m] = periodStr.split("-").map(Number);
          await recalculateMonthlyFastPayers(y, m, dateType);
        }

        await recalculateUserPunctuality(request.userId);
      } catch (err) {
        console.error("Failed to recalculate gamification rewards:", err);
      }
    }

    if (status === "REJECTED") {
      for (const inst of request.installments) {
        await prisma.installment.update({
          where: { id: inst.id },
          data: { paymentRequestId: null },
        });
      }
      for (const pay of request.payments) {
        await prisma.payment.update({
          where: { id: pay.id },
          data: { paymentRequestId: null },
        });
      }
    }

    const updatedRequest = await prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedById: adminUserId,
      },
    });

    if (request.messageId) {
      try {
        const chatId = getTelegramGroupChatId();
        const globalConfig = (await getGlobalConfigs()) as GlobalConfigType;
        const locale = resolveTelegramMessageLocale(globalConfig);

        const messageText = buildPaymentRequestReviewMessage(
          {
            requestId,
            status,
            fullName: `${request.user.firstName} ${request.user.lastName}`,
            amount: Number(request.amount),
          },
          locale,
        );

        const tgResult = await sendTelegramMessage(
          chatId.toString(),
          messageText,
          undefined,
          undefined,
          request.messageId,
        );

        if (tgResult?.message_id) {
          await prisma.paymentRequest.update({
            where: { id: requestId },
            data: { adminReplyId: tgResult.message_id },
          });
        }
      } catch (tgError) {
        console.error("Failed to reply to Telegram receipt message:", tgError);
      }
    }

    revalidatePath(`/${DASHBOARD_URL}/payment-requests`);
    revalidatePath(`/${DASHBOARD_URL}/installments`);
    revalidatePath(`/${DASHBOARD_URL}/payments`);
    revalidatePath(`/${DASHBOARD_URL}/loans`);
    revalidatePath("/installments");
    revalidatePath("/payments");
    revalidatePath("/home");

    return {
      status: "SUCCESS",
      message: `Payment request has been ${status.toLowerCase()} successfully.`,
    };
  } catch (error) {
    console.error("Failed to review payment request:", error);
    return { status: "ERROR", message: "Failed to review payment request" };
  }
}
