"use server";

import { changePasswordValidationSchema } from "utils/form-validations/user/changePasswordValidation";
import { getSession } from "utils/auth/dataAccessLayer";
import prisma from "@database/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { ChangePasswordResponseType } from "utils/form-validations/user/changePasswordValidation";

export async function updateUserPanelPassword(
    formData: FormData,
): Promise<ChangePasswordResponseType> {
    const session = await getSession();
    if (!session?.userId) {
        return { status: "ERROR", message: "Unauthorized" };
    }

    const validatedFields = await changePasswordValidationSchema.safeParseAsync({
        id: formData.get("id"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return {
            status: "ERROR",
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    if (validatedFields.data.id !== Number(session.userId)) {
        return { status: "ERROR", message: "Unauthorized" };
    }

    try {
        await prisma.user.update({
            where: { id: validatedFields.data.id },
            data: {
                password: bcrypt.hashSync(validatedFields.data.password, 10),
            },
        });
        revalidatePath("/profile");
        return { status: "SUCCESS", message: "Password updated successfully" };
    } catch {
        return { status: "ERROR", message: "Failed to update password" };
    }
}
