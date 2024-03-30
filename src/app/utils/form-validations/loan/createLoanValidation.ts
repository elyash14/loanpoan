import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

const basicValidation = {
    amount: z.coerce.number().min(0),
    accountId: z.coerce.number(),
    description: z.string().nullable(),
    paymentCount: z.coerce.number().min(1),
    paymentAmount: z.coerce.number().min(1),
    startedAt: z.date(),
};

// this validation schema will be run just on the client
export const createLoanValidationSchema = z.object(basicValidation);

// this validation schema will be run on the server (extended schema).
export const createLoanValidationSchemaOnTheServer = z.object({
    ...basicValidation,
    // code: z.string().min(2).max(8).refine(async (code) => {
    //     return await checkUniquenessOfCode(code);
    // }, { message: "This code is already exists!" }),
    // userId: z.coerce.number().refine(async (userId) => {
    //     return await checkUserIfNotExist(userId);
    // }, { message: "User not found!" }),
});

export type CreateLoanResponseType = ActionResponse & {
    error?: {
        amount?: string[] | undefined;
        accountId?: string[] | undefined;
        description?: string[] | undefined;
        paymentCount?: string[] | undefined;
        startedAt?: string[] | undefined;
    }
};

export type CreateLoanFormSchemaInputType = z.input<typeof createLoanValidationSchema>;
export type CreateLoanFormSchemaOutputType = z.output<typeof createLoanValidationSchema>;