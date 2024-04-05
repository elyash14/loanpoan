import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

const basicValidation = {
    id: z.coerce.number(),
    email: z.string().email(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    gender: z.enum(["WOMAN","MAN"]),
    password: z.string().min(8, "Password must be at least 8 characters long"),
};

// this validation schema will be run just on the client
export const editUserValidationSchema = z.object(basicValidation);

// this validation schema will be run on the server (extended schema).
// export const editUserValidationSchemaOnTheServer = z.object({
//     ...basicValidation,
// }).superRefine(async (val, ctx) => {
//     if (await checkEmailUniqueness(val.email, val.id)) {
//         ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             path: ['email'],
//             message: "This email is already exists!",
//         });
//     }
// });

export type EditUserResponseType = ActionResponse & {
    error?: {
        id?: string[] | undefined;
        firstName?: string[] | undefined;
        lastName?: string[] | undefined;
        email?: string[] | undefined;
        password?: string[] | undefined;
    }
};

export type EditUserFormSchemaInputType = z.input<typeof editUserValidationSchema>;
export type EditUserFormSchemaOutputType = z.output<typeof editUserValidationSchema>;