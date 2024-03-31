
import { ActionResponse } from "utils/types/actionFormTypes";
import { GlobalConfigType } from "utils/types/configs";
import { z } from "zod";

export const saveCurrencySchema = z.object({
    name: z.string(),
    symbol: z.string(),
});

export type SaveCurrencyResponseType = ActionResponse & {
    data?: GlobalConfigType;
    error?: {
        name?: string[] | undefined;
        symbol?: string[] | undefined;
    }
};

export type SaveCurrencyFormSchemaInputType = z.input<typeof saveCurrencySchema>;
export type SaveCurrencyFormSchemaOutputType = z.output<typeof saveCurrencySchema>;