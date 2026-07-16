'use client';

import PagePaper from "@dashboard/components/paper/PagePaper";
import { loginAsAdmin } from "@database/user/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextInput, Title, rem, Text } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
    LoginFormFormSchemaInputType,
    loginValidatorSchema,
} from "utils/form-validations/auth/loginValidator";

const ADMIN_ERROR_MESSAGES: Record<string, string> = {
    EMAIL_NOT_FOUND: "Email not found",
    ACCOUNT_DEACTIVATED: "Account is deactivated",
    INVALID_CREDENTIALS: "Invalid credentials",
    USE_ADMIN_LOGIN: "Please use the admin login page",
    USE_MEMBER_LOGIN: "This page is for admins only. Use the member login.",
    UNKNOWN: "Something went wrong!",
};

function translateAdminError(code: string) {
    return ADMIN_ERROR_MESSAGES[code] ?? ADMIN_ERROR_MESSAGES.UNKNOWN;
}

export default function AdminLoginForm() {
    const {
        register,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormFormSchemaInputType>({
        resolver: zodResolver(loginValidatorSchema, {}, { raw: true }),
    });

    const onSubmit: SubmitHandler<LoginFormFormSchemaInputType> = async (data) => {
        const formData = new FormData();
        for (const field of Object.keys(data) as Array<keyof typeof data>) {
            formData.append(`${field}`, `${data[field]}`);
        }

        const result = await loginAsAdmin(formData);
        if (result && result.status === "ERROR") {
            for (const e in result.error!) {
                const raw = result.error?.[e as "email" | "password"];
                const code = Array.isArray(raw) ? String(raw[0]) : String(raw ?? "UNKNOWN");
                setError(e as "email" | "password", {
                    message: translateAdminError(code),
                });
            }
        }
    };

    return (
        <PagePaper>
            <Title ta="center" mb={rem(8)} order={2}>
                Admin login
            </Title>
            <Text ta="center" c="dimmed" size="sm" mb={rem(40)}>
                Sign in to the management dashboard
            </Text>

            <form onSubmit={handleSubmit(onSubmit)}>
                <TextInput
                    label="Email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    {...register("email")}
                    error={errors.email?.message}
                />

                <TextInput
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    autoComplete="current-password"
                    mt="md"
                    {...register("password")}
                    error={errors.password?.message}
                />

                <Button
                    fullWidth
                    mb={rem(5)}
                    mt={rem(40)}
                    size="lg"
                    rightSection={<IconLogin />}
                    loading={isSubmitting}
                    type="submit"
                >
                    Log In
                </Button>
            </form>
        </PagePaper>
    );
}
