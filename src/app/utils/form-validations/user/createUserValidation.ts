import { checkEmailUniqueness } from "@database/user/validations";
import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

const userValidation = {
    email: z.string().email(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    gender: z.enum(["WOMAN","MAN"]),
    password: z.string().min(8, "Password must be at least 8 characters long"),
     // confirmPassword: z.string().min(8, "Confirmation password must be at least 8 characters long"),
   };

// This validation schema will be run on the client
export const createUserValidationSchema = z.object(userValidation);

// This validation schema will be run on the server (extended schema).
export const createUserValidationSchemaOnTheServer = z.object({
 ...userValidation,
 email: z.string().email().refine(async (email) => {
    // Example of an asynchronous check for email uniqueness
    return await checkEmailUniqueness(email);
 }, { message: "This email is already in use!" }),
//  userId: z.number().refine(async (userId) => {
//     // Example of an asynchronous check for user existence
//     return await checkUserIfNotExist(userId);
//  }, { message: "User not found!" }),
//  confirmPassword: z.string().min(8, "Confirmation password must be at least 8 characters long").refine((data) => data.password === data.confirmPassword, {
//         message: "Passwords do not match",
//         path: ["confirmPassword"],
//     }),
});


export type CreateUserResponseType = ActionResponse & {
    error?: {
        firstName?: string[] | undefined;
        lastName?: string[] | undefined;
        email?: string[] | undefined;
        userId?: string[] | undefined;
        gender?: string[] | undefined;
    }
};


export type CreateUserFormSchemaInputType = z.input<typeof createUserValidationSchema>;
