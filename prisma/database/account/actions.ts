"use server";

import prisma from "@database/prisma";
import { CreateAccountResponseType, createAccountValidationSchemaOnTheServer } from "utils/form-validations/createAccountValidation";

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
