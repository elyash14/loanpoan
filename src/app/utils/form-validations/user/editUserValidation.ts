import { checkEmailUniqueness, checkTelegramIdUniqueness } from "@database/user/validations";
import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

const basicValidation = {
    id: z.coerce.number(),
    email: z.string().email(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    gender: z.enum(["WOMAN","MAN"]),
    telegramId: z.string().optional().or(z.literal("")),
    telegramUsername: z.string().max(100).optional().or(z.literal("")),
};

// this validation schema will be run just on the client
export const editUserValidationSchema = z.object(basicValidation);

// this validation schema will be run on the server (extended schema).
export const editUserValidationSchemaOnTheServer = z.object({
    ...basicValidation,
}).superRefine(async (val, ctx) => {
    if (!(await checkEmailUniqueness(val.email, val.id))) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['email'],
            message: "This email is already exists!",
        });
    }
    if (val.telegramId && !/^\d+$/.test(val.telegramId)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['telegramId'],
            message: "Telegram ID must be numeric",
        });
    }
    if (val.telegramId) {
        const telegramId = BigInt(val.telegramId);
        if (!(await checkTelegramIdUniqueness(telegramId, val.id))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['telegramId'],
                message: "This Telegram ID is already linked to another user",
            });
        }
    }
});

export type EditUserResponseType = ActionResponse & {
    error?: {
        id?: string[] | undefined;
        firstName?: string[] | undefined;
        lastName?: string[] | undefined;
        email?: string[] | undefined;
        telegramId?: string[] | undefined;
        telegramUsername?: string[] | undefined;
    }
};

export type EditUserFormSchemaInputType = z.input<typeof editUserValidationSchema>;
export type EditUserFormSchemaOutputType = z.output<typeof editUserValidationSchema>;