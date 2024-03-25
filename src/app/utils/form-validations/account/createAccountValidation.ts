import { checkUniquenessOfCode } from "@database/account/validations";
import { checkUserIfNotExist } from "@database/user/validations";
import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

const basicValidation = {
    code: z.string().min(2).max(8),
    name: z.string().nullable(),
    installmentFactor: z.coerce.number().min(0).max(10),
    userId: z.coerce.number().min(1, "Please select a user"),
};

// this validation schema will be run just on the client
export const createAccountValidationSchema = z.object(basicValidation);

// this validation schema will be run on the server (extended schema).
export const createAccountValidationSchemaOnTheServer = z.object({
    ...basicValidation,
    code: z.string().min(2).max(8).refine(async (code) => {
        return await checkUniquenessOfCode(code);
    }, { message: "This code is already exists!" }),
    userId: z.coerce.number().refine(async (userId) => {
        return await checkUserIfNotExist(userId);
    }, { message: "User not found!" }),
});

export type CreateAccountResponseType = ActionResponse & {
    error?: {
        code?: string[] | undefined;
        name?: string[] | undefined;
        installmentFactor?: string[] | undefined;
        userId?: string[] | undefined;
    }
};

export type CreateAccountFormSchemaInputType = z.input<typeof createAccountValidationSchema>;
export type CreateAccountFormSchemaOutputType = z.output<typeof createAccountValidationSchema>;