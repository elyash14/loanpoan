import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

const basicValidation = {
    id: z.coerce.number(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
};

// this validation schema will be run just on the client
export const changePasswordValidationSchema = z.object(basicValidation);


export type ChangePasswordResponseType = ActionResponse & {
    error?: {
        id?: string[] | undefined;
        password?: string[] | undefined;
    }};

export type ChangePasswordFormSchemaInputType = z.input<typeof changePasswordValidationSchema>;
export type ChangePasswordFormSchemaOutputType = z.output<typeof changePasswordValidationSchema>;