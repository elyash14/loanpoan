'use client';

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import UserLogout from "../../components/UserLogout";
import { updateUserPanelPassword } from "@database/user-panel/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import {
    ChangePasswordFormSchemaInputType,
    changePasswordValidationSchema,
} from "utils/form-validations/user/changePasswordValidation";

type Profile = {
    id: number;
    email: string;
    fullName: string;
    cardNumber: string | null;
    accountNumber: string | null;
    telegramUsername: string | null;
    telegramId: string | null;
};

type Props = {
    profile: string;
    authProvider: string;
};

export default function ProfileView({ profile, authProvider }: Props) {
    const user = useMemo(() => JSON.parse(profile) as Profile, [profile]);
    const isEmailAuth = authProvider !== "telegram";

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ChangePasswordFormSchemaInputType>({
        resolver: zodResolver(changePasswordValidationSchema, {}, { raw: true }),
        defaultValues: { id: user.id },
    });

    const onSubmit = async (data: ChangePasswordFormSchemaInputType) => {
        const formData = new FormData();
        formData.append("id", String(data.id));
        formData.append("password", data.password);
        const result = await updateUserPanelPassword(formData);
        if (result.status === "ERROR" && result.error) {
            for (const key of Object.keys(result.error) as Array<keyof typeof result.error>) {
                setError(key as "password", { message: String(result.error[key]) });
            }
        } else if (result.status === "SUCCESS") {
            reset({ id: user.id, password: "" });
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{user.fullName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Email</span>
                        <span>{user.email}</span>
                    </div>
                    {user.cardNumber ? (
                        <div className="flex justify-between">
                            <span>Card</span>
                            <span>{user.cardNumber}</span>
                        </div>
                    ) : null}
                    {user.accountNumber ? (
                        <div className="flex justify-between">
                            <span>Account</span>
                            <span>{user.accountNumber}</span>
                        </div>
                    ) : null}
                    {user.telegramUsername ? (
                        <div className="flex justify-between">
                            <span>Telegram</span>
                            <span>@{user.telegramUsername}</span>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {isEmailAuth ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Change password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                            <input type="hidden" {...register("id")} />
                            <div>
                                <label className="text-sm font-medium">New password</label>
                                <input
                                    type="password"
                                    className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                                    {...register("password")}
                                />
                                {errors.password ? (
                                    <p className="mt-1 text-xs text-[var(--color-destructive)]">
                                        {errors.password.message}
                                    </p>
                                ) : null}
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                Update password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            ) : null}

            <UserLogout />
        </div>
    );
}
