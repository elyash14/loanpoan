
import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

export const saveGeneralConfigSchema = z.object({
    applicationName: z.string(),
    dateType: z.enum(["GREGORIAN", "JALALI"])
});

export type SaveGeneralConfigResponseType = ActionResponse & {
    error?: {
        applicationName?: string[] | undefined;
        dateType?: string[] | undefined;
    }
};

export type SaveGeneralConfigFormSchemaInputType = z.input<typeof saveGeneralConfigSchema>;
export type SaveGeneralConfigFormSchemaOutputType = z.output<typeof saveGeneralConfigSchema>;