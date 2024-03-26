
import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

export const createInstallmentAmountSchema = z.object({
    amount: z.coerce.number().min(1),
});

export type CreateInstallmentAmountResponseType = ActionResponse & {
    error?: {
        amount?: string[] | undefined;
    }
};

export type CreateInstallmentAmountFormSchemaInputType = z.input<typeof createInstallmentAmountSchema>;
export type CreateInstallmentAmountFormSchemaOutputType = z.output<typeof createInstallmentAmountSchema>;