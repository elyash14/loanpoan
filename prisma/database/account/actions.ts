"use server";

import prisma from "@database/prisma";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";
import { CreateAccountResponseType, createAccountValidationSchemaOnTheServer } from "utils/form-validations/account/createAccountValidation";
import { editAccountValidationSchema } from "utils/form-validations/account/editAccountValidation";

export async function createAccount(formData: FormData): Promise<CreateAccountResponseType> {
  // validate the form data on the server
  const validatedFields = await createAccountValidationSchemaOnTheServer.safeParseAsync({
    code: formData.get('code'),
    name: formData.get('name'),
    installmentFactor: formData.get('installmentFactor'),
    userId: formData.get('userId'),
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
    await prisma.account.create({
      data: {
        code: validatedFields.data.code,
        name: validatedFields.data.name,
        installmentFactor: validatedFields.data.installmentFactor,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          connect: {
            id: validatedFields.data.userId,
          },
        }
      },
    });

    // revalidate the list of accounts page after updating an account.
    revalidatePath(`/${DASHBOARD_URL}/accounts`);
    return {
      status: "SUCCESS",
      message: "Account created successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to create account",
    }
  }
}

export async function updateAccount(formData: FormData): Promise<CreateAccountResponseType> {
  // validate the form data on the server
  const validatedFields = await editAccountValidationSchema.safeParseAsync({
    id: formData.get('id'),
    name: formData.get('name'),
    code: formData.get('code'),
    installmentFactor: formData.get('installmentFactor'),
  })

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      status: "ERROR",
      error: validatedFields.error.flatten().fieldErrors,
    }
  }
  // update data to the database
  try {
    await prisma.account.update({
      where: {
        id: validatedFields.data.id,
      },
      data: {
        code: validatedFields.data.code,
        name: validatedFields.data.name,
        installmentFactor: validatedFields.data.installmentFactor,
        updatedAt: new Date(),
      },
    });
    // revalidate the list of accounts page after updating an account.
    revalidatePath(`/${DASHBOARD_URL}/accounts`);
    return {
      status: "SUCCESS",
      message: "Account updated successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to update the account",
    }
  }
}

export async function deleteAccount(id: number) {
  //TODO check if the account has installments or loan before deleting it.
  try {
    await prisma.account.delete({
      where: {
        id,
      },
    });
    // revalidate the list of accounts page after updating an account.
    revalidatePath(`/${DASHBOARD_URL}/accounts`);
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