
import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

export const saveGeneralConfigSchema = z.object({
    applicationName: z.string(),
});

export type SaveGeneralConfigResponseType = ActionResponse & {
    error?: {
        applicationName?: string[] | undefined;
    }
};

export type SaveGeneralConfigFormSchemaInputType = z.input<typeof saveGeneralConfigSchema>;
export type SaveGeneralConfigFormSchemaOutputType = z.output<typeof saveGeneralConfigSchema>;