
import { ActionResponse } from "utils/types/actionFormTypes";
import { GlobalConfigType } from "utils/types/configs";
import { z } from "zod";

export const saveLoanConfigSchema = z.object({
    minimumFactor: z.coerce.number().min(1),
    maximumFactor: z.coerce.number().min(2),
    restrict: z.coerce.boolean()
}).superRefine((val, ctx) => {
    if (val.minimumFactor >= val.maximumFactor) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['minimumFactor'],
            message: "Minimum factor must be less than maximum factor!",
        });
    }
    if (val.maximumFactor <= val.minimumFactor) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['maximumFactor'],
            message: "Maximum factor must be greater than minimum factor!",
        });
    }
});;

export type SaveLoanConfigResponseType = ActionResponse & {
    data?: GlobalConfigType;
    error?: {
        minimumFactor?: string[] | undefined;
        maximumFactor?: string[] | undefined;
        restrict?: string[] | undefined;
    }
};

export type SaveLoanConfigFormSchemaInputType = z.input<typeof saveLoanConfigSchema>;
export type SaveLoanConfigFormSchemaOutputType = z.output<typeof saveLoanConfigSchema>;