"use server";

import prisma from "@database/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "utils/auth/session";
import { DASHBOARD_URL } from "utils/configs";
import { LoginFormResponseType, loginValidatorSchema } from "utils/form-validations/auth/loginValidator";
import { ChangePasswordResponseType, changePasswordValidationSchema } from "utils/form-validations/user/changePasswordValidation";
import { CreateUserResponseType, createUserValidationSchemaOnTheServer } from "utils/form-validations/user/createUserValidation";
import { editUserValidationSchemaOnTheServer } from "utils/form-validations/user/editUserValidation";
import { getUserByEmail } from "./data";

export async function createUser(formData: FormData): Promise<CreateUserResponseType> {
    // validate the form data on the server
    const validatedFields = await createUserValidationSchemaOnTheServer.safeParseAsync({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        gender: formData.get('gender'),
        password: formData.get('password'),
    })

    // Return early if the form data is invalid
    if (!validatedFields.success) {
        return {
            status: "ERROR",
            error: validatedFields.error.flatten().fieldErrors,
        }
    }
    // save data to the database
    try {
        await prisma.user.create({
            data: {
                firstName: validatedFields.data.firstName,
                lastName: validatedFields.data.lastName,
                email: validatedFields.data.email,
                gender: validatedFields.data.gender,
                password: bcrypt.hashSync(validatedFields.data.password, 10),
                createdAt: new Date(),
            },
        });
        revalidatePath(`/${DASHBOARD_URL}/users`);
        return {
            status: "SUCCESS",
            message: "User created successfully",
        }
    } catch (error) {
        console.error(error);
        return {
            status: "ERROR",
            message: "Failed to create user",
        }
    }
}

export async function updateUser(formData: FormData): Promise<CreateUserResponseType> {
    // validate the form data on the server
    const validatedFields = await editUserValidationSchemaOnTheServer.safeParseAsync({
        id: formData.get('id'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        gender: formData.get('gender'),
    })

    // Return early if the form data is invalid
    if (!validatedFields.success) {
        return {
            status: "ERROR",
            error: validatedFields.error.flatten().fieldErrors,
        }
    }
    try {
        await prisma.user.update({
            where: {
                id: validatedFields.data.id,
            },
            data: {
                firstName: validatedFields.data.firstName,
                lastName: validatedFields.data.lastName,
                gender: validatedFields.data.gender,
                email: validatedFields.data.email,
                // updatedAt: new Date(),
            },
        });
        // revalidate the list of accounts page after updating an account.
        revalidatePath(`/${DASHBOARD_URL}/users`);
        return {
            status: "SUCCESS",
            message: "User updated successfully",
        }
    } catch (error) {
        console.error(error);
        return {
            status: "ERROR",
            message: "Failed to update the user",
        }
    }
}

export async function updatePassword(formData: FormData): Promise<ChangePasswordResponseType> {
    // validate the form data on the server
    const validatedFields = await changePasswordValidationSchema.safeParseAsync({
        id: formData.get('id'),
        password: formData.get('password'),
    })

    // Return early if the form data is invalid
    if (!validatedFields.success) {
        return {
            status: "ERROR",
            error: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        await prisma.user.update({
            where: {
                id: validatedFields.data.id,
            },
            data: {
                password: bcrypt.hashSync(validatedFields.data.password, 10)
                // updatedAt: new Date(),
            },
        });
        // revalidate the list of accounts page after updating an account.
        revalidatePath(`/${DASHBOARD_URL}/users`);
        return {
            status: "SUCCESS",
            message: "User updated successfully",
        }
    } catch (error) {
        console.error(error);
        return {
            status: "ERROR",
            message: "Failed to update the user",
        }
    }
}

export async function login(
    formData: FormData,
): Promise<LoginFormResponseType> {
    // validate the form data on the server
    const validatedFields = await loginValidatorSchema.safeParseAsync({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    // Return early if the form data is invalid
    if (!validatedFields.success) {
        return {
            status: "ERROR",
            error: validatedFields.error.flatten().fieldErrors,
        }
    }

    let redirectRoute = '/';
    try {
        // fetch user and compare it with credential
        const user = await getUserByEmail(validatedFields.data.email);
        if (!user) {
            return {
                status: "ERROR",
                error: {
                    email: ['Email not found'],
                },
            }
        };
        const passwordsMatch = await bcrypt.compare(validatedFields.data.password, user.password);
        if (!passwordsMatch) {
            return {
                status: "ERROR",
                error: {
                    password: ['Invalid credentials'],
                },
            }
        };

        // create user session
        await createSession(user)

        if (user.role === 'ADMIN') {
            redirectRoute = `/${DASHBOARD_URL}`;
        }
    } catch (error) {
        return {
            status: "ERROR",
            error: {
                email: ['Something went wrong!'],
            },
        };
    }

    // redirect user
    redirect(redirectRoute);
}

export async function logout() {
    deleteSession();
    redirect('/login');
}

