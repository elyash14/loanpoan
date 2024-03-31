import { checkMinAndMaxLoanAmount } from "@database/loan/validations";
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
export const createLoanValidationSchemaOnTheServer = z.object(basicValidation).superRefine(async (val, ctx) => {
    const check = await checkMinAndMaxLoanAmount(val.amount, val.accountId);
    if (check.maximumError) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: `Total amount can't be greater than ${check.maximum}`,
        });
    }
    if (check.minimumError) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: `Total amount can't be less than ${check.minimum}`,
        });
    }
    //TODO check the current balance of bank
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