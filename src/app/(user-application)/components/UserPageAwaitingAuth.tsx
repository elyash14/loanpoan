'use client';

import { isTelegramWebApp } from "./telegram/TelegramProvider";
import { useUserPreferences } from "./preferences/UserPreferencesProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserPageAwaitingAuth() {
    const router = useRouter();
    const { t } = useUserPreferences();

    useEffect(() => {
        const refresh = () => router.refresh();
        const interval = window.setInterval(refresh, 800);

        const timeout = window.setTimeout(() => {
            if (!isTelegramWebApp()) {
                router.replace("/login");
            }
        }, 5000);

        return () => {
            window.clearInterval(interval);
            window.clearTimeout(timeout);
        };
    }, [router]);

    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">{t("common.signingInShort")}</p>
        </div>
    );
}
