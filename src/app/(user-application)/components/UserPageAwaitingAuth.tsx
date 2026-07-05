'use client';

import { isTelegramWebApp } from "./telegram/TelegramProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserPageAwaitingAuth() {
    const router = useRouter();

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
            <p className="text-sm text-[var(--color-muted-foreground)]">Signing you in…</p>
        </div>
    );
}
