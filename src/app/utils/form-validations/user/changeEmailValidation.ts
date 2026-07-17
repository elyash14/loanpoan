import { z } from "zod";

export const changeEmailValidationSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "EMAIL_REQUIRED")
        .email("EMAIL_INVALID")
        .max(254, "EMAIL_INVALID")
        .transform((email) => email.toLowerCase()),
});

export type ChangeEmailFormInput = z.input<typeof changeEmailValidationSchema>;

export type ChangeEmailResponse = {
    status: "SUCCESS" | "ERROR";
    message?: string;
    email?: string;
    error?: {
        email?: string[];
    };
};
