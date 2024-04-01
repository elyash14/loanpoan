"use server";

import prisma from "@database/prisma";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";

export async function payAPayment(id: number) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id },
    });

    // check this payment has been paid or not
    if (!payment || payment.payedAt) {
      return {
        status: "ERROR",
        message: "The payment already has been paid",
      }
    }

    // pay
    await prisma.payment.update({
      where: { id },
      data: { payedAt: new Date() }
    });

    // check this payment was the last payments of the loan
    const count = await prisma.payment.count({
      where: {
        loanId: payment.loanId,
        payedAt: null
      }
    });

    if (count === 0) {
      await prisma.loan.update({
        where: { id: payment.loanId! },
        data: { status: "FINISHED" }
      });
      revalidatePath(`/${DASHBOARD_URL}/loans`);
    }

    // revalidate the list of accounts page after updating an account.
    revalidatePath(`/${DASHBOARD_URL}/payments`);
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