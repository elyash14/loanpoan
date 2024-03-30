"use server";

import { getGlobalConfigs } from "@database/config/data";
import prisma from "@database/prisma";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";
import { CreateLoanResponseType, createLoanValidationSchemaOnTheServer } from "utils/form-validations/loan/createLoanValidation";
import { calculateLoanPayments } from "utils/loan/calculatePayment";
import { GlobalConfigType } from "utils/types/configs";

export async function createLoan(formData: FormData): Promise<CreateLoanResponseType> {
  // validate the form data on the server
  const validatedFields = await createLoanValidationSchemaOnTheServer.safeParseAsync({
    amount: formData.get('amount'),
    accountId: formData.get('accountId'),
    description: formData.get('description'),
    paymentCount: formData.get('paymentCount'),
    paymentAmount: formData.get('paymentAmount'),
    startedAt: new Date(formData.get('startedAt') as string),
  });

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      status: "ERROR",
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  // get configs
  const config = (await getGlobalConfigs()) as GlobalConfigType;

  // calculate payments 
  const { payments, error } = calculateLoanPayments(
    validatedFields.data.amount, validatedFields.data.paymentCount,
    validatedFields.data.paymentAmount, validatedFields.data.startedAt,
    config.dateType
  );
  if (error) {
    return {
      status: "ERROR", error: {
        paymentCount: ["Invalid payment count"],
      }
    }
  }

  // save data to the database
  try {
    await prisma.loan.create({
      data: {
        amount: validatedFields.data.amount,
        description: validatedFields.data.description,
        paymentCount: validatedFields.data.paymentCount,
        createdAt: new Date(),
        startedAt: validatedFields.data.startedAt,
        finishedAt: payments[payments.length - 1].date,
        account: {
          connect: {
            id: validatedFields.data.accountId,
          },
        },
        payments: {
          createMany: {
            data: payments.map(p => ({
              amount: p.amount,
              dueDate: p.date,
            })),
          }
        }
      },
    });
    // revalidate the list of accounts page after updating an account.
    revalidatePath(`/${DASHBOARD_URL}/loans`);
    return {
      status: "SUCCESS",
      message: "Loan created successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to create loan",
    }
  }
}

export async function deleteLoan(id: number) {
  //TODO check if the account has installments or loan before deleting it.
  try {
    // check this loan has any payed payments or not
    if (await loanHasPaidPayments(id)) {
      return {
        status: "ERROR",
        message: "This loan has already paid payments. You can not delete it",
      }
    }

    // delete all payments of this loan
    const deleteAllPayments = prisma.payment.deleteMany({ where: { loanId: id } });
    // delete the loan
    const deleteLoan = prisma.loan.delete({
      where: {
        id,
      },
    });
    // using transaction to ensure both of them will be completed
    await prisma.$transaction([deleteAllPayments, deleteLoan]);

    // revalidate the list of accounts page after updating an account.
    revalidatePath(`/${DASHBOARD_URL}/loans`);
    return {
      status: "SUCCESS",
      message: "Account delete successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to delete the account",
    }
  }
}

export async function loanHasPaidPayments(loanId: number) {
  const count = await prisma.payment.count({
    where: { loanId, payedAt: { not: null } },
  });

  return count > 0;
}