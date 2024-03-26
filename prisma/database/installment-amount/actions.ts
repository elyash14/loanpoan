"use server";

import prisma from "@database/prisma";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";
import { CreateInstallmentAmountResponseType, createInstallmentAmountSchema } from "utils/form-validations/installment-amount/createInstallmentAmount";

export async function createInstallmentAmount(formData: FormData): Promise<CreateInstallmentAmountResponseType> {
  // validate the form data on the server
  const validatedFields = createInstallmentAmountSchema.safeParse({
    amount: formData.get('amount'),
  })
  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      status: "ERROR",
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  // save data to the database
  try {
    // deprecate all old installment amounts
    await prisma.installmentAmount.updateMany({
      data: {
        deprecatedAt: new Date(),
      }
    })
    await prisma.installmentAmount.create({
      data: {
        amount: validatedFields.data.amount,
        createdAt: new Date(),
      },
    });

    revalidatePath(`/${DASHBOARD_URL}/configs`);
    return {
      status: "SUCCESS",
      message: "Installment Amount created successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to create account",
    }
  }
}
