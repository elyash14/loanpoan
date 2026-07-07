'use client';

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

function isTelegramWebApp(): boolean {
    return typeof window !== "undefined" && Boolean(window.Telegram?.WebApp);
}

function applyTelegramTheme() {
    const tg = window.Telegram?.WebApp;
    const root = document.getElementById("user-app");
    if (!tg || !root) return;

    const tp = tg.themeParams;
    const scheme = tg.colorScheme ?? "dark";

    root.classList.remove("light", "dark");
    root.classList.add(scheme);

    if (tp.bg_color) {
        root.style.setProperty("--color-background", tp.bg_color);
        tg.setHeaderColor(tp.bg_color);
        tg.setBackgroundColor(tp.bg_color);
    }
    if (tp.text_color) {
        root.style.setProperty("--color-foreground", tp.text_color);
    }
    if (tp.secondary_bg_color) {
        root.style.setProperty("--color-card", tp.secondary_bg_color);
        root.style.setProperty("--color-nav", `${tp.secondary_bg_color}d9`);
    }
    if (tp.hint_color) {
        root.style.setProperty("--color-muted-foreground", tp.hint_color);
    }
    if (tp.button_color) {
        root.style.setProperty("--color-primary", tp.button_color);
    }
    if (tp.button_text_color) {
        root.style.setProperty("--color-primary-foreground", tp.button_text_color);
    }
}

export default function TelegramProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
            setReady(true);
            return;
        }

        tg.ready();
        tg.expand();
        applyTelegramTheme();

        if (pathname === "/link-required") {
            setReady(true);
            return;
        }

        const initData = tg.initData;
        if (initData) {
            fetch("/api/auth/telegram", {
                method: "POST",
                headers: { Authorization: `tma ${initData}` },
                credentials: "include",
            })
                .then(async (res) => {
                    if (res.status === 403) {
                        router.replace("/link-required");
                    } else if (!res.ok) {
                        router.replace("/link-required");
                    } else if (res.ok) {
                        router.refresh();
                    }
                })
                .finally(() => setReady(true));
        } else {
            setReady(true);
        }
    }, [router, pathname]);

    if (!ready) {
        return (
            <div className="user-shell-bg flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
                <div
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-sm font-bold text-[var(--color-primary-foreground)]"
                >
                    NF
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">Signing you in</p>
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                        Connecting to your account
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
