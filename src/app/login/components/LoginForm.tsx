'use client';

import PagePaper from "@dashboard/components/paper/PagePaper";
import { login } from "@database/user/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextInput, Title, rem } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { LoginFormFormSchemaInputType, loginValidatorSchema } from "utils/form-validations/auth/loginValidator";

export default function LoginForm() {
    const {
        register,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormFormSchemaInputType>({
        resolver: zodResolver(loginValidatorSchema, {}, { raw: true }),
    });

    const onSubmit: SubmitHandler<LoginFormFormSchemaInputType> = async (
        data,
    ) => {
        // create a form data
        const formData = new FormData();
        for (const field of Object.keys(data) as Array<keyof typeof data>) {
            formData.append(`${field}`, `${data[field]}`);
        }

        // send it to the server with server actions
        const result = await login(formData);
        if (result && result.status === "ERROR") {
            for (const e in result.error!) {
                setError(e as any, {
                    message: String(
                        result.error?.[
                        e as "email" | "password"
                        ],
                    ),
                });
            }
        }
    };

    //TODO add captcha code

    //TODO use csrf 

    return (
        <PagePaper>
            <Title ta="center" mb={rem(50)} order={2}>Please log in to continue</Title>

            <form onSubmit={handleSubmit(onSubmit)} >
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
                    type="submit">
                    Log In
                </Button>
            </form>
        </PagePaper>
    );
}