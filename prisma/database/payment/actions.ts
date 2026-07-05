"use server";

import prisma from "@database/prisma";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";

export async function payAPayment(id: number) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id },
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
      await prisma.loan.update({
        where: { id: payment.loanId! },
        data: { status: "FINISHED" }
      });
      revalidatePath(`/${DASHBOARD_URL}/loans`);
    }

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
