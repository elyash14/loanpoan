"use server";

import { getGlobalConfigs } from "@database/config/data";
import { getCurrentInstallmentAmount } from "@database/installment-amount/data";
import prisma from "@database/prisma";
import { addMonths, setDate } from 'date-fns-jalali';
import { revalidatePath } from "next/cache";
import { getSession } from 'utils/auth/dataAccessLayer';
import { DASHBOARD_URL } from "utils/configs";
import { GlobalConfigType } from "utils/types/configs";

// import { revalidatePath } from "next/cache";
// import { DASHBOARD_URL } from "utils/configs";

export async function payAnInstallment(id: number) {
  try {
    const installment = await prisma.installment.findFirst({
      where: { id },
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

    // revalidate the list of installments page after updating an installment.
    revalidatePath(`/${DASHBOARD_URL}/installments`);
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
    await calculateUndueInstallments();
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

const calculateUndueInstallments = async () => {
  let results: any[] = [];
  const currentDate = new Date();
  // const currentDate = new Date('2025-12-06');
  // const currentDate = new Date('2025-01-22');

  // load configs
  const config = (await getGlobalConfigs()) as GlobalConfigType;

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
        const installmentData = results.map(installment => ({
          accountId: account.id,
          amount: Number(currentInstallment?.amount ?? 0) * account.installmentFactor,
          dueDate: installment.dueDate,
          installmentAmountId: currentInstallment?.id,
          type: "NORMAL" as const,
        }));

        // Create installments
        await prisma.installment.createMany({
          data: installmentData,
        });

        // Update account balance **************
        // const totalAmount = installmentData.reduce((sum, installment) =>
        //   Number(sum) + Number(installment.amount), 0);
        // await prisma.account.update({
        //   where: { id: account.id },
        //   data: {
        //     balance: {
        //       increment: totalAmount
        //     }
        //   }
        // });
        const totalAmount = await prisma.installment.aggregate({
          _sum: {
            amount: true
          },
          where: {
            accountId: account.id,
            // paidAt: { not: null }
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
}

const _generateInstallmentsDateForAccount = (initialDate: Date, currentDate: Date, config: GlobalConfigType) => {
  const dueDay = config.installment?.dueDay ?? 1;
  const payDay = config.installment?.payDay ?? 5;
  const dateType = config.dateType ?? 'GREGORIAN'

  const results = [];
  // Calculate installments between last installment due date and current date
  let startDate = new Date(initialDate);
  while (startDate <= currentDate) {
    let nextMonth;
    let nextPay;

    if (dateType === 'JALALI') {
      nextMonth = setDate(addMonths(startDate, 1), dueDay);
      nextPay = setDate(addMonths(startDate, 1), payDay);
    } else {
      nextMonth = new Date(startDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(dueDay);

      nextPay = new Date(startDate);
      nextPay.setMonth(nextPay.getMonth() + 1);
      nextPay.setDate(payDay);
    }

    // Create the installment in the database or collect for further processing
    const newInstallment = {
      dueDate: nextMonth,
      payDate: nextPay,
    };

    results.push(newInstallment); // Collecting for further processing or DB insertion

    startDate = nextMonth!; // Move the startDate to the next month
  }
  return results;
}