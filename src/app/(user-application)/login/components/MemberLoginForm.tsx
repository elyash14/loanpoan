'use client';

import { loginAsMember } from "@database/user/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { Button } from "../../components/ui/button";
import { cn } from "utils/cn";
import TelegramLoginRedirect from "./TelegramLoginRedirect";

type LoginFields = {
    email: string;
    password: string;
};

const LOGIN_ERROR_CODES = [
    "EMAIL_NOT_FOUND",
    "ACCOUNT_DEACTIVATED",
    "INVALID_CREDENTIALS",
    "USE_ADMIN_LOGIN",
    "USE_MEMBER_LOGIN",
    "UNKNOWN",
] as const;

type LoginErrorCode = (typeof LOGIN_ERROR_CODES)[number];

function isLoginErrorCode(value: string): value is LoginErrorCode {
    return (LOGIN_ERROR_CODES as readonly string[]).includes(value);
}

export default function MemberLoginForm() {
    const { t, locale, setLocale } = useUserPreferences();
    const [formError, setFormError] = useState<string | null>(null);

    const schema = useMemo(
        () =>
            z.object({
                email: z.string().email({ message: t("login.errors.invalidEmail") }),
                password: z.string().min(3, { message: t("login.errors.passwordMin") }),
            }),
        [t],
    );

    const translateServerError = (codeOrMessage: string) => {
        const code = String(codeOrMessage);
        if (isLoginErrorCode(code)) {
            return t(`login.errors.${code}`);
        }
        return t("login.errors.UNKNOWN");
    };

    const {
        register,
        setError,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFields>({
        resolver: zodResolver(schema, {}, { raw: true }),
    });

    const onSubmit: SubmitHandler<LoginFields> = async (data) => {
        setFormError(null);
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);

        const result = await loginAsMember(formData);
        if (result && result.status === "ERROR") {
            let firstMessage: string | null = null;
            for (const field of ["email", "password"] as const) {
                const raw = result.error?.[field];
                if (!raw) continue;
                const code = Array.isArray(raw) ? String(raw[0]) : String(raw);
                const message = translateServerError(code);
                setError(field, { message });
                if (!firstMessage) firstMessage = message;
            }
            if (firstMessage) setFormError(firstMessage);
        }
    };

    return (
        <>
            <TelegramLoginRedirect />
            <div className="relative flex min-h-dvh flex-col overflow-hidden px-5 pb-10 pt-6">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(199_72%_42%_/_0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_hsl(160_50%_35%_/_0.12),_transparent_50%)]" />
                    <div className="absolute -start-24 top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                    <div className="absolute -end-16 bottom-32 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
                </div>

                <div className="mb-8 flex items-center justify-between">
                    <p className="text-sm font-semibold tracking-tight text-foreground/90">
                        {t("login.brand")}
                    </p>
                    <div
                        className="inline-flex rounded-full border border-border/60 bg-card/50 p-0.5 backdrop-blur-sm"
                        role="group"
                        aria-label={t("login.language")}
                    >
                        <button
                            type="button"
                            onClick={() => setLocale("fa")}
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                locale === "fa"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            فا
                        </button>
                        <button
                            type="button"
                            onClick={() => setLocale("en")}
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                locale === "en"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            EN
                        </button>
                    </div>
                </div>

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
                    <div className="mb-8 space-y-2 text-center">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            {t("login.brand")}
                        </h1>
                        <p className="text-lg font-semibold text-foreground/90">
                            {t("login.title")}
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {t("login.subtitle")}
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 rounded-2xl border border-border/50 bg-card/70 p-5 shadow-(--shadow-soft) backdrop-blur-md"
                    >
                        <div className="space-y-1.5">
                            <label
                                htmlFor="login-email"
                                className="text-xs font-medium text-muted-foreground"
                            >
                                {t("login.email")}
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                placeholder={t("login.emailPlaceholder")}
                                className={cn(
                                    "h-11 w-full rounded-xl border border-border/70 bg-background/60 px-3.5 text-sm outline-none transition-[border-color,box-shadow]",
                                    "placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                                    errors.email && "border-destructive/60 focus:ring-destructive/20",
                                )}
                                {...register("email")}
                            />
                            {errors.email?.message ? (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="login-password"
                                className="text-xs font-medium text-muted-foreground"
                            >
                                {t("login.password")}
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                placeholder={t("login.passwordPlaceholder")}
                                className={cn(
                                    "h-11 w-full rounded-xl border border-border/70 bg-background/60 px-3.5 text-sm outline-none transition-[border-color,box-shadow]",
                                    "placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                                    errors.password && "border-destructive/60 focus:ring-destructive/20",
                                )}
                                {...register("password")}
                            />
                            {errors.password?.message ? (
                                <p className="text-xs text-destructive">{errors.password.message}</p>
                            ) : null}
                        </div>

                        {formError && !errors.email && !errors.password ? (
                            <p className="text-xs text-destructive">{formError}</p>
                        ) : null}

                        <Button
                            type="submit"
                            size="lg"
                            disabled={isSubmitting}
                            className="mt-2 h-12 w-full rounded-xl text-base font-semibold"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                                    {t("login.submitting")}
                                </>
                            ) : (
                                t("login.submit")
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
