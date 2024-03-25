import { checkUniquenessOfCode } from "@database/account/validations";
import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

const basicValidation = {
    id: z.coerce.number(),
    code: z.string().min(2).max(8),
    name: z.string().nullable(),
    installmentFactor: z.coerce.number().min(0).max(10),
};

// this validation schema will be run just on the client
export const editAccountValidationSchema = z.object(basicValidation);

// this validation schema will be run on the server (extended schema).
export const editAccountValidationSchemaOnTheServer = z.object({
    ...basicValidation,
}).superRefine(async (val, ctx) => {
    if (await checkUniquenessOfCode(val.code, val.id)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['code'],
            message: "This code is already exists!",
        });
    }
});

export type EditAccountResponseType = ActionResponse & {
    error?: {
        code?: string[] | undefined;
        name?: string[] | undefined;
        installmentFactor?: string[] | undefined;
    }
};

export type EditAccountFormSchemaInputType = z.input<typeof editAccountValidationSchema>;
export type EditAccountFormSchemaOutputType = z.output<typeof editAccountValidationSchema>;