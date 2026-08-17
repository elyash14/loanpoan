import { checkMinAndMaxLoanAmount } from "@database/loan/validations";
import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

const basicValidation = {
    amount: z.coerce.number().min(0),
    accountId: z.coerce.number(),
    description: z.string().optional().nullable(),
    paymentCount: z.coerce.number().min(1),
    // 0 means split the total evenly; the payments modal may set a custom monthly amount
    paymentAmount: z.coerce.number().min(0),
    // Mantine 9 DatePickerInput returns a YYYY-MM-DD string, not a Date object
    startedAt: z.union([z.date(), z.string().min(1, "Start date is required")]),
};

type LoanAmountLimits = {
    restrict?: boolean;
    minimum?: number;
    maximum?: number;
};

function withAmountLimits<T extends z.ZodType>(schema: T, limits?: LoanAmountLimits) {
    return schema.superRefine((val, ctx) => {
        if (!limits?.restrict) {
            return;
        }
        const amount = (val as { amount: number }).amount;
        if (limits.maximum != null && amount > limits.maximum) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["amount"],
                message: `Total amount can't be greater than ${limits.maximum.toLocaleString()}`,
            });
        }
        if (limits.minimum != null && amount < limits.minimum) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["amount"],
                message: `Total amount can't be less than ${limits.minimum.toLocaleString()}`,
            });
        }
    });
}

// this validation schema will be run just on the client
export const createLoanValidationSchema = z.object(basicValidation);

export function getCreateLoanValidationSchema(limits?: LoanAmountLimits) {
    return withAmountLimits(z.object(basicValidation), limits);
}

// this validation schema will be run on the server (extended schema).
export const createLoanValidationSchemaOnTheServer = z.object({
    ...basicValidation,
    startedAt: z.coerce.date(),
}).superRefine(async (val, ctx) => {
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
        paymentAmount?: string[] | undefined;
        startedAt?: string[] | undefined;
    }
};

export type CreateLoanFormSchemaInputType = z.input<typeof createLoanValidationSchema>;
export type CreateLoanFormSchemaOutputType = z.output<typeof createLoanValidationSchema>;
