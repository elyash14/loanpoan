"use server";

import type { UserPreferences } from "@user/i18n";
import { processPaymentRequestSubmission } from "@database/user-panel/paymentRequestSubmission";
import { changePasswordValidationSchema } from "utils/form-validations/user/changePasswordValidation";
import {
    profileValidationSchema,
    type ProfileResponseType,
} from "utils/form-validations/user/profileValidation";
import { getSession } from "utils/auth/dataAccessLayer";
import prisma from "@database/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { ChangePasswordResponseType } from "utils/form-validations/user/changePasswordValidation";
import {
    changeEmailValidationSchema,
    type ChangeEmailResponse,
} from "utils/form-validations/user/changeEmailValidation";
import { createSession } from "utils/auth/session";
import {
    avatarPublicUrl,
    removeAvatarFile,
    saveAvatarFile,
} from "utils/uploads/avatars";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type AvatarResponseType = {
    status: "SUCCESS" | "ERROR";
    message?: string;
    avatarUrl?: string | null;
};

function extensionForMime(type: string) {
    if (type === "image/png") return "png";
    if (type === "image/webp") return "webp";
    return "jpg";
}

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

export async function updateUserPanelEmail(
    formData: FormData,
): Promise<ChangeEmailResponse> {
    const session = await getSession();
    if (!session?.userId) {
        return { status: "ERROR", message: "UNAUTHORIZED" };
    }

    const validatedFields = changeEmailValidationSchema.safeParse({
        email: formData.get("email"),
    });

    if (!validatedFields.success) {
        return {
            status: "ERROR",
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const userId = Number(session.userId);
    const email = validatedFields.data.email;

    try {
        const emailOwner = await prisma.user.findFirst({
            where: {
                email: { equals: email, mode: "insensitive" },
                id: { not: userId },
            },
            select: { id: true },
        });

        if (emailOwner) {
            return {
                status: "ERROR",
                error: { email: ["EMAIL_TAKEN"] },
            };
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { email },
        });

        const authProvider =
            session.authProvider === "telegram" ? "telegram" : "email";
        await createSession(updatedUser, authProvider);
        revalidatePath("/profile");

        return {
            status: "SUCCESS",
            message: "EMAIL_UPDATED",
            email: updatedUser.email,
        };
    } catch {
        return { status: "ERROR", message: "EMAIL_UPDATE_FAILED" };
    }
}

export async function updateUserPanelProfile(
    formData: FormData,
): Promise<ProfileResponseType> {
    const session = await getSession();
    if (!session?.userId) {
        return { status: "ERROR", message: "Unauthorized" };
    }

    const validatedFields = await profileValidationSchema.safeParseAsync({
        profileColor: formData.get("profileColor"),
    });

    if (!validatedFields.success) {
        return {
            status: "ERROR",
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await prisma.user.update({
            where: { id: Number(session.userId) },
            data: {
                profileColor: validatedFields.data.profileColor,
            },
        });
        revalidatePath("/profile");
        revalidatePath("/home");
        return { status: "SUCCESS", message: "Profile updated successfully" };
    } catch {
        return { status: "ERROR", message: "Failed to update profile" };
    }
}

export async function updateUserPanelAvatar(formData: FormData): Promise<AvatarResponseType> {
    const session = await getSession();
    if (!session?.userId) {
        return { status: "ERROR", message: "Unauthorized" };
    }

    const file = formData.get("avatar");
    if (!(file instanceof File) || file.size === 0) {
        return { status: "ERROR", message: "No file selected" };
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
        return { status: "ERROR", message: "Invalid file type" };
    }

    if (file.size > MAX_AVATAR_BYTES) {
        return { status: "ERROR", message: "File is too large" };
    }

    const userId = Number(session.userId);
    const extension = extensionForMime(file.type);
    const fileName = `${userId}-${Date.now()}.${extension}`;
    const avatarUrl = avatarPublicUrl(fileName);

    try {
        const existing = await prisma.user.findUnique({
            where: { id: userId },
            select: { avatar: true },
        });

        const buffer = Buffer.from(await file.arrayBuffer());
        await saveAvatarFile(fileName, buffer);

        await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
        });

        await removeAvatarFile(existing?.avatar);

        revalidatePath("/profile");
        revalidatePath("/home");
        return { status: "SUCCESS", message: "Avatar updated successfully", avatarUrl };
    } catch {
        return { status: "ERROR", message: "Failed to upload avatar" };
    }
}

export async function clearUserPanelAvatar(): Promise<AvatarResponseType> {
    const session = await getSession();
    if (!session?.userId) {
        return { status: "ERROR", message: "Unauthorized" };
    }

    const userId = Number(session.userId);

    try {
        const existing = await prisma.user.findUnique({
            where: { id: userId },
            select: { avatar: true },
        });

        if (!existing?.avatar) {
            return { status: "SUCCESS", message: "Avatar cleared", avatarUrl: null };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { avatar: null },
        });

        await removeAvatarFile(existing.avatar);

        revalidatePath("/profile");
        revalidatePath("/home");
        return { status: "SUCCESS", message: "Avatar cleared", avatarUrl: null };
    } catch {
        return { status: "ERROR", message: "Failed to clear avatar" };
    }
}

export async function updateUserPreferences(prefs: UserPreferences) {
    const session = await getSession();
    if (!session?.userId) {
        return { status: "ERROR", message: "Unauthorized" };
    }

    try {
        await prisma.user.update({
            where: { id: Number(session.userId) },
            data: {
                preferences: prefs as any, // Cast as any because prisma Json type might require it
            },
        });
        return { status: "SUCCESS", message: "Preferences updated successfully" };
    } catch {
        return { status: "ERROR", message: "Failed to update preferences" };
    }
}

export async function submitPaymentRequest(formData: FormData) {
    const session = await getSession();
    if (!session?.userId) {
        return { status: "ERROR", code: "unauthorized", message: "Unauthorized" };
    }

    return processPaymentRequestSubmission(Number(session.userId), formData);
}

