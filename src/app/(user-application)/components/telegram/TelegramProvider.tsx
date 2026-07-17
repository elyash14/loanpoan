'use client';

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useUserPreferences } from "../preferences/UserPreferencesProvider";
import { applyCurrentTelegramTheme } from "../preferences/applyPreferences";

function isTelegramWebApp(): boolean {
    return typeof window !== "undefined" && Boolean(window.Telegram?.WebApp?.initData);
}

export default function TelegramProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);
    const { t } = useUserPreferences();

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        const root = document.getElementById("user-app");
        const handleThemeChange = () => {
            if (root) applyCurrentTelegramTheme(root);
        };

        if (tg) {
            tg.ready();
            tg.expand();
            handleThemeChange();
            tg.onEvent?.("themeChanged", handleThemeChange);
        }

        if (pathname === "/link-required") {
            return () => tg?.offEvent?.("themeChanged", handleThemeChange);
        }

        if (!tg?.initData) {
            return () => tg?.offEvent?.("themeChanged", handleThemeChange);
        }

        fetch("/api/auth/telegram", {
            method: "POST",
            headers: { Authorization: `tma ${tg.initData}` },
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) {
                    router.replace("/link-required");
                } else {
                    router.refresh();
                }
            })
            .finally(() => setReady(true));

        return () => tg.offEvent?.("themeChanged", handleThemeChange);
    }, [router, pathname]);

    if (isTelegramWebApp() && pathname !== "/link-required" && !ready) {
        return (
            <div className="user-shell-bg flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
                <div
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-sm font-bold text-[var(--color-primary-foreground)]"
                >
                    PL
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">{t("common.signingIn")}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                        {t("common.signingInHint")}
                    </p>
                </div>
                <div className="h-1 w-24 overflow-hidden rounded-full bg-[var(--color-muted)]">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--color-primary)]" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export { isTelegramWebApp };
