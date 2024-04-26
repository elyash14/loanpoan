
import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

export const loginValidatorSchema = z.object({
    email: z.string().email(),
    password: z.string().min(3)
});

export type LoginFormResponseType = ActionResponse & {
    error?: {
        email?: string[] | undefined;
        password?: string[] | undefined;
    }
};

export type LoginFormFormSchemaInputType = z.input<typeof loginValidatorSchema>;