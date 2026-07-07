'use client';

import BottomDrawer from "../../components/ui/BottomDrawer";
import { Button } from "../../components/ui/button";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { updateUserPanelPassword } from "@database/user-panel/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    ChangePasswordFormSchemaInputType,
    changePasswordValidationSchema,
} from "utils/form-validations/user/changePasswordValidation";

type Props = {
    open: boolean;
    onClose: () => void;
    userId: number;
};

export default function ProfilePasswordDrawer({ open, onClose, userId }: Props) {
    const { t } = useUserPreferences();
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordFormSchemaInputType>({
        resolver: zodResolver(changePasswordValidationSchema, {}, { raw: true }),
        defaultValues: { id: userId },
    });

    const handleClose = () => {
        reset({ id: userId, password: "" });
        onClose();
    };

    const onSubmit = async (data: ChangePasswordFormSchemaInputType) => {
        const formData = new FormData();
        formData.append("id", String(data.id));
        formData.append("password", data.password);
        const result = await updateUserPanelPassword(formData);
        if (result.status === "ERROR" && result.error) {
            for (const key of Object.keys(result.error) as Array<keyof typeof result.error>) {
                setError(key as "password", { message: String(result.error[key]) });
            }
            return;
        }
        if (result.status === "SUCCESS") {
            reset({ id: userId, password: "" });
            window.setTimeout(handleClose, 500);
        }
    };

    return (
        <BottomDrawer
            open={open}
            onClose={handleClose}
            title={t("profile.changePassword")}
            description={t("profile.changePasswordDesc")}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...register("id")} />
                <div>
                    <label className="text-sm font-medium">{t("profile.newPassword")}</label>
                    <input
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none ring-ring focus-visible:ring-2"
                        {...register("password")}
                    />
                    {errors.password ? (
                        <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                    ) : null}
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {t("profile.updatePassword")}
                </Button>
            </form>
        </BottomDrawer>
    );
}
