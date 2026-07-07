'use client';

import BottomNav from "./BottomNav";
import TelegramBackButton from "../telegram/TelegramBackButton";
import { cn } from "utils/cn";
import type { MessageKey } from "../../i18n";
import { useUserPreferences } from "../preferences/UserPreferencesProvider";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    title?: string;
    titleKey?: MessageKey;
    hideNav?: boolean;
    description?: string;
    descriptionKey?: MessageKey;
    showBack?: boolean;
    backHref?: string;
};

export default function UserShell({
    children,
    title,
    titleKey,
    hideNav,
    description,
    descriptionKey,
    showBack = false,
    backHref = "/more",
}: Props) {
    const { t } = useUserPreferences();
    const pageTitle = titleKey ? t(titleKey) : title ?? t("app.name");
    const pageDescription = descriptionKey ? t(descriptionKey) : description;

    return (
        <div className="user-shell-bg flex min-h-dvh flex-col">
            <a
                href="#user-main"
                className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-md)] focus:bg-[var(--color-primary)] focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-primary-foreground)]"
            >
                {t("common.skipToContent")}
            </a>

            <header
                className={cn(
                    "sticky top-0 z-40 border-b border-[var(--color-border)]/60",
                    "bg-[var(--color-nav)] backdrop-blur-xl backdrop-saturate-150",
                    "pt-[max(0.5rem,env(safe-area-inset-top))]",
                )}
            >
                <div className="mx-auto flex h-[var(--shell-header-height)] w-full max-w-lg items-center gap-3 px-4">
                    {showBack ? (
                        <>
                            <TelegramBackButton href={backHref} />
                            <Link
                                href={backHref}
                                aria-label={t("profile.back")}
                                className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
                                    "border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)]",
                                    "transition-colors hover:bg-[var(--color-muted)]",
                                )}
                            >
                                <ChevronLeft className="h-5 w-5 rtl-flip" strokeWidth={2} />
                            </Link>
                        </>
                    ) : (
                        <div
                            aria-hidden
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-xs font-bold tracking-tight text-[var(--color-primary-foreground)] shadow-[inset_0_1px_0_hsl(0_0%_100%_/0.2)]"
                        >
                            NF
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                            {t("app.name")}
                        </p>
                        <h1 className="truncate text-base font-semibold leading-tight tracking-tight">
                            {pageTitle}
                        </h1>
                        {pageDescription ? (
                            <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                                {pageDescription}
                            </p>
                        ) : null}
                    </div>
                </div>
            </header>

            <main
                id="user-main"
                className={cn(
                    "mx-auto w-full max-w-lg flex-1 px-4 pt-5",
                    hideNav
                        ? "pb-[max(1.25rem,env(safe-area-inset-bottom))]"
                        : "pb-[calc(var(--shell-nav-offset)+env(safe-area-inset-bottom,0px)+1rem)]",
                )}
            >
                {children}
            </main>

            {!hideNav && <BottomNav />}
        </div>
    );
}
