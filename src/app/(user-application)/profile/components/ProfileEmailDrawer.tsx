'use client';

import { updateUserPanelEmail } from "@database/user-panel/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    changeEmailValidationSchema,
    type ChangeEmailFormInput,
} from "utils/form-validations/user/changeEmailValidation";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import BottomDrawer from "../../components/ui/BottomDrawer";
import { Button } from "../../components/ui/button";

type Props = {
    open: boolean;
    onClose: () => void;
    email: string;
    onEmailUpdated: (email: string) => void;
};

export default function ProfileEmailDrawer({
    open,
    onClose,
    email,
    onEmailUpdated,
}: Props) {
    const { t } = useUserPreferences();
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChangeEmailFormInput>({
        resolver: zodResolver(changeEmailValidationSchema),
        defaultValues: { email },
    });

    const errorText = (code?: string) => {
        if (code === "EMAIL_REQUIRED") return t("profile.emailRequired");
        if (code === "EMAIL_TAKEN") return t("profile.emailTaken");
        if (code === "EMAIL_UPDATE_FAILED") return t("profile.emailUpdateFailed");
        return t("profile.emailInvalid");
    };

    const handleClose = () => {
        reset({ email });
        onClose();
    };

    const onSubmit = async (data: ChangeEmailFormInput) => {
        const formData = new FormData();
        formData.append("email", data.email);
        const result = await updateUserPanelEmail(formData);

        const fieldError = result.error?.email?.[0];
        if (fieldError) {
            setError("email", { message: fieldError });
            return;
        }

        if (result.status === "ERROR") {
            setError("email", { message: "EMAIL_UPDATE_FAILED" });
            return;
        }

        if (result.email) {
            onEmailUpdated(result.email);
            reset({ email: result.email });
            onClose();
        }
    };

    return (
        <BottomDrawer
            open={open}
            onClose={handleClose}
            title={t("profile.changeEmail")}
            description={t("profile.changeEmailDesc")}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="text-sm font-medium">{t("profile.newEmail")}</label>
                    <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none ring-ring focus-visible:ring-2"
                        {...register("email")}
                    />
                    {errors.email ? (
                        <p className="mt-1 text-xs text-destructive">
                            {errorText(errors.email.message)}
                        </p>
                    ) : null}
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? t("profile.updatingEmail") : t("profile.updateEmail")}
                </Button>
            </form>
        </BottomDrawer>
    );
}
