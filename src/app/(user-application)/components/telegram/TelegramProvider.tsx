'use client';

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

function isTelegramWebApp(): boolean {
    return typeof window !== "undefined" && Boolean(window.Telegram?.WebApp);
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

        const tp = tg.themeParams;
        const root = document.getElementById("user-app");
        if (root && tp.bg_color) {
            root.style.setProperty("--color-background", tp.bg_color);
        }
        if (root && tp.text_color) {
            root.style.setProperty("--color-foreground", tp.text_color);
        }
        if (tp.bg_color) {
            tg.setHeaderColor(tp.bg_color);
            tg.setBackgroundColor(tp.bg_color);
        }

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
            <div className="flex min-h-dvh items-center justify-center">
                <p className="text-sm text-[var(--color-muted-foreground)]">Loading…</p>
            </div>
        );
    }

    return <>{children}</>;
}

export { isTelegramWebApp };
