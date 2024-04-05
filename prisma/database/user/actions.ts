"use server";

import prisma from "@database/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";
import { CreateUserResponseType, createUserValidationSchemaOnTheServer } from "utils/form-validations/user/createUserValidation";
import { editUserValidationSchema } from "utils/form-validations/user/editUserValidation";

export async function createUser(formData: FormData): Promise<CreateUserResponseType> {
 // validate the form data on the server
 const validatedFields = await createUserValidationSchemaOnTheServer.safeParseAsync({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),  
    email: formData.get('email'),
    gender: formData.get('gender'),
    password: formData.get('password'),
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
    await prisma.user.create({
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        email: validatedFields.data.email,
        gender: validatedFields.data.gender,
        password: bcrypt.hashSync(validatedFields.data.password, 10),
        createdAt: new Date(),
      },
    });
    return {
      status: "SUCCESS",
      message: "User created successfully",
    }
 } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to create user",
    }
 }
}

export async function updateUser(formData: FormData): Promise<CreateUserResponseType> {
  // validate the form data on the server
  const validatedFields = await editUserValidationSchema.safeParseAsync({
    id: formData.get('id'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    gender: formData.get('gender'),
    password: formData.get('password'),
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
    await prisma.user.update({
      where: {
        id: validatedFields.data.id,
      },
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        gender: validatedFields.data.gender,
        email: validatedFields.data.email,
        password: validatedFields.data.password,
        // updatedAt: new Date(),
      },
    });
    // revalidate the list of accounts page after updating an account.
    revalidatePath(`/${DASHBOARD_URL}/users`);
    return {
      status: "SUCCESS",
      message: "User updated successfully",
    }
  } catch (error) {
    console.error(error);
    return {
      status: "ERROR",
      message: "Failed to update the user",
    }
  }
}