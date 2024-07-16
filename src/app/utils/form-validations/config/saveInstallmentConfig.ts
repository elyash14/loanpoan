
import { ActionResponse } from "utils/types/actionFormTypes";
import { GlobalConfigType } from "utils/types/configs";
import { z } from "zod";

export const saveInstallmentConfigSchema = z.object({
    dueDay: z.coerce.number().min(1).max(29),
    payDay: z.coerce.number().min(2).max(29),
}).refine(data => data.payDay > data.dueDay, {
    message: "payDay must be greater than dueDay",
    path: ["payDay"], // specify the path of the error
});

export type SaveInstallmentConfigResponseType = ActionResponse & {
    data?: GlobalConfigType;
    error?: {
        dueDay?: string[] | undefined;
        payDay?: string[] | undefined;
    }
};

export type SaveInstallmentConfigFormSchemaInputType = z.input<typeof saveInstallmentConfigSchema>;
export type SaveInstallmentConfigFormSchemaOutputType = z.output<typeof saveInstallmentConfigSchema>;