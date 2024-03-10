"use server";

import prisma from "@database/prisma";
import bcrypt from "bcrypt";
import { revalidateTag } from "next/cache";

export async function createUser(formData: FormData) {
  try {
    // save data and return object
    await prisma.user.create({
      data: {
        email: formData.get("email") as string,
        password: bcrypt.hashSync(formData.get("password") as string, 10),
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        gender: "MAN",
      },
    });
  } catch (error) {
    throw new Error("Failed to create user");
  }

  revalidateTag("users-list");
}
