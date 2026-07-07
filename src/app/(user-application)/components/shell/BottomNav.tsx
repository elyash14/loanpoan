'use client';

import { cn } from "utils/cn";
import { Home, LayoutGrid, Wallet } from "lucide-react";
import { LoanIcon } from "../icons/LoanIcon";
import { useUserPreferences } from "../preferences/UserPreferencesProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

function triggerHaptic() {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
}

export default function BottomNav() {
    const pathname = usePathname();
    const { t } = useUserPreferences();

    const tabs = useMemo(
        () => [
            { href: "/home", labelKey: "nav.home" as const, icon: Home },
            { href: "/accounts", labelKey: "nav.accounts" as const, icon: Wallet },
            { href: "/loans", labelKey: "nav.loans" as const, icon: LoanIcon },
            { href: "/more", labelKey: "nav.more" as const, icon: LayoutGrid },
        ],
        [],
    );

    const moreRoutes = ["/more", "/installments", "/payments", "/profile", "/settings"];

    const isActive = useCallback(
        (href: string) => {
            if (href === "/more") {
                return moreRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
            }
            return pathname === href || pathname.startsWith(`${href}/`);
        },
        [pathname],
    );

    return (
        <nav
            aria-label={t("nav.main")}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
            <div
                className={cn(
                    "pointer-events-auto relative mx-auto max-w-lg overflow-visible",
                    "rounded-[2rem] border border-[var(--color-border)]/60",
                    "bg-[var(--color-card)] shadow-[var(--shadow-nav)]",
                    "px-2 pb-2 pt-7",
                )}
            >
                <div className="grid grid-cols-4 items-end">
                    {tabs.map(({ href, labelKey, icon: Icon }) => {
                        const active = isActive(href);
                        const label = t(labelKey);

                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active ? "page" : undefined}
                                aria-label={label}
                                onClick={triggerHaptic}
                                className={cn(
                                    "relative flex flex-col items-center justify-end",
                                    "min-h-[3.25rem] transition-[color,transform] duration-200 ease-out",
                                    "active:scale-[0.97]",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-card)]",
                                )}
                            >
                                {active ? (
                                    <>
                                        <span
                                            aria-hidden
                                            className="absolute left-1/2 top-0 z-0 h-[4.25rem] w-[4.25rem] -translate-x-1/2 -translate-y-[54%] rounded-full bg-[var(--color-card)]"
                                        />
                                        <span
                                            aria-hidden
                                            className={cn(
                                                "absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[58%]",
                                                "flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full",
                                                "border-[5px] border-[var(--color-card)] bg-[var(--color-primary)]",
                                                "text-[hsl(210_40%_98%)] shadow-[0_8px_24px_hsl(217_91%_60%_/0.45)]",
                                                "transition-transform duration-200",
                                            )}
                                        >
                                            <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={2.25} />
                                        </span>
                                        <span className="relative z-10 mt-5 text-xs font-semibold text-[var(--color-primary)]">
                                            {label}
                                        </span>
                                    </>
                                ) : (
                                    <span className="flex h-12 w-full items-center justify-center text-[var(--color-muted-foreground)]">
                                        <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.75} />
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
