'use client';

import { CalendarClock, Wallet, WalletCards } from "lucide-react";
import Link from "next/link";
import { LoanIcon } from "../../components/icons/LoanIcon";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";

export default function HomeQuickActions() {
    const { t } = useUserPreferences();

    const quickActions = [
        { href: "/accounts", labelKey: "pages.accounts" as const, icon: Wallet },
        { href: "/loans", labelKey: "pages.loans" as const, icon: LoanIcon },
        { href: "/installments?from=home", labelKey: "pages.installments" as const, icon: CalendarClock },
        { href: "/payments?from=home", labelKey: "pages.payments" as const, icon: WalletCards },
    ];

    return (
        <div className="space-y-2.5">
            <p className="px-1 text-sm font-semibold tracking-tight text-foreground/90">{t("home.quickActions")}</p>
            <div className="grid grid-cols-2 gap-2.5">
                {quickActions.map(({ href, labelKey, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-md active:scale-[0.98]"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                            <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                        </span>
                        <span className="text-xs font-semibold text-foreground/80">{t(labelKey)}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
