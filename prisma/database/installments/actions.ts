"use server";

import { getGlobalConfigs } from "@database/config/data";
import { getCurrentInstallmentAmount } from "@database/installment-amount/data";
import prisma from "@database/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from 'utils/auth/dataAccessLayer';
import { DASHBOARD_URL } from "utils/configs";
import { GlobalConfigType } from "utils/types/configs";
import { notifyInstallmentGeneration } from "utils/telegram/notifyInstallmentGeneration";
import { notifyLoanPriorityQueue } from "utils/telegram/notifyLoanPriorityQueue";
import { recalculateUserPunctuality } from "@database/gamification/punctuality";
import {
  addCalendarMonths,
  buildPeriodDates,
  healDeadlineIfNeeded,
} from "utils/installmentTiming";

export async function payAnInstallment(id: number) {
  try {
    const installment = await prisma.installment.findFirst({
      where: { id },
      include: {
        account: { select: { userId: true } },
      },
    });

    // check this installment has been paid or not
    if (!installment || installment.paidAt) {
      return {
        status: "ERROR",
        message: "The installment already has been paid",
      }
    }

    const session = await getSession();

    // pay
    await prisma.installment.update({
      where: { id },
      data: {
        paidAt: new Date(),
        approvedById: Number(session?.userId!),
        approvedAt: new Date(),
      }
    });

    // Update account balance
    const totalAmount = await prisma.installment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        accountId: installment.accountId,
        paidAt: { not: null }
      }
    })
    await prisma.account.update({
      where: { id: installment.accountId! },
      data: {
        balance: Number(totalAmount._sum.amount)
      }
    });

    if (installment.account?.userId) {
      try {
        await recalculateUserPunctuality(installment.account.userId);
      } catch (err) {
        console.error("Failed to recalculate punctuality:", err);
      }
    }

    // revalidate the list of installments page after updating an installment.
    revalidatePath(`/${DASHBOARD_URL}/installments`);
    revalidatePath("/home");
    return {
      status: "SUCCESS",
      message: "Installment paid successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to pay the installment",
    }
  }
}

export async function generateAllUndueInstallments() {
  try {
    const result = await calculateUndueInstallments();
    await notifyInstallmentGeneration(result.createdCount, result.dueDates);
    if (result.createdCount > 0) {
      await notifyLoanPriorityQueue();
    }
    // revalidate the list of accounts page after updating an account.
    revalidatePath(`/${DASHBOARD_URL}/installments`);
    return {
      status: "SUCCESS",
      message: "Installments generated successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to generate installments",
    }
  }
}

const calculateUndueInstallments = async (): Promise<{ createdCount: number; dueDates: Date[] }> => {
  let results: { dueDate: Date }[] = [];
  const currentDate = new Date();
  let createdCount = 0;
  const dueDates: Date[] = [];

  // load configs
  const config = (await getGlobalConfigs()) as GlobalConfigType;
  const dueDay = config.installment?.dueDay ?? 1;
  const payDay = config.installment?.payDay ?? 5;
  const dateType = config.dateType ?? "JALALI";

  // Heal unpaid rows that still store generation-day as dueDate
  await healUnpaidInstallmentDeadlines(dueDay, payDay, dateType);

  // load current 
  const currentInstallment = await getCurrentInstallmentAmount();

  const accounts = await prisma.account.findMany({
    where: {
      deletedAt: null
    }
  });

  for (const account of accounts) {
    // Get the last installment date for the current account
    const lastInstallment = await prisma.installment.findFirst({
      where: {
        accountId: account.id
      },
      orderBy: {
        dueDate: 'desc'
      }
    });

    const initialDate = lastInstallment ? lastInstallment.dueDate : account.openedAt!;

    if (initialDate) {
      results = _generateInstallmentsDateForAccount(initialDate, currentDate, config);
      if (results.length > 0) {
        const installmentAmount = Number(currentInstallment?.amount ?? 0) * account.installmentFactor;
        const installmentData = results.map(installment => ({
          accountId: account.id,
          amount: installmentAmount,
          dueDate: installment.dueDate,
          installmentAmountId: currentInstallment?.id,
          type: "NORMAL" as const,
        }));

        // Create installments
        await prisma.installment.createMany({
          data: installmentData,
        });

        createdCount += installmentData.length;
        dueDates.push(...installmentData.map((item) => item.dueDate));

        const totalAmount = await prisma.installment.aggregate({
          _sum: {
            amount: true
          },
          where: {
            accountId: account.id,
          }
        })
        await prisma.account.update({
          where: { id: account.id },
          data: {
            balance: Number(totalAmount._sum.amount)
          }
        });
      }
    }
  }

  return { createdCount, dueDates };
}

/**
 * Shift unpaid installment dueDates from generation day (dueDay) to deadline (payDay)
 * in the same calendar month — heals data from the old meaning of dueDate.
 */
async function healUnpaidInstallmentDeadlines(
  dueDay: number,
  payDay: number,
  dateType: "JALALI" | "GREGORIAN",
) {
  const unpaid = await prisma.installment.findMany({
    where: { paidAt: null },
    select: { id: true, dueDate: true },
  });

  for (const row of unpaid) {
    const healed = healDeadlineIfNeeded(row.dueDate, dueDay, payDay, dateType);
    if (!healed) continue;
    await prisma.installment.update({
      where: { id: row.id },
      data: { dueDate: healed },
    });
  }

  const unpaidPayments = await prisma.payment.findMany({
    where: { paidAt: null },
    select: { id: true, dueDate: true },
  });

  for (const row of unpaidPayments) {
    const healed = healDeadlineIfNeeded(row.dueDate, dueDay, payDay, dateType);
    if (!healed) continue;
    await prisma.payment.update({
      where: { id: row.id },
      data: { dueDate: healed },
    });
  }
}

/**
 * From the last stored deadline (or account open date), walk forward month by month.
 * Create an installment once the generation day (dueDay) has been reached.
 * Persist dueDate as the payment deadline (payDay).
 */
const _generateInstallmentsDateForAccount = (
  initialDate: Date,
  currentDate: Date,
  config: GlobalConfigType,
) => {
  const dueDay = config.installment?.dueDay ?? 1;
  const payDay = config.installment?.payDay ?? 5;
  const dateType = config.dateType ?? "JALALI";

  const results: { dueDate: Date }[] = [];
  let cursor = new Date(initialDate);

  // Safety: avoid infinite loops if clock/config is odd
  for (let i = 0; i < 120; i++) {
    const nextMonthAnchor = addCalendarMonths(cursor, 1, dateType);
    const { openAt, deadlineAt } = buildPeriodDates(
      nextMonthAnchor,
      dueDay,
      payDay,
      dateType,
    );

    // Not yet time to generate this period
    if (currentDate < openAt) {
      break;
    }

    results.push({ dueDate: deadlineAt });
    cursor = deadlineAt;
  }

  return results;
}
