'use client';

import UserShell from "../components/shell/UserShell";
import Link from "next/link";
import { Calendar, ChevronRight, CreditCard, Settings, User } from "lucide-react";
import { useUserPreferences } from "../components/preferences/UserPreferencesProvider";

export default function MorePage() {
    const { t } = useUserPreferences();

    const links = [
        {
            href: "/installments",
            labelKey: "more.installments" as const,
            descKey: "more.installmentsDesc" as const,
            icon: Calendar,
        },
        {
            href: "/payments",
            labelKey: "more.payments" as const,
            descKey: "more.paymentsDesc" as const,
            icon: CreditCard,
        },
        {
            href: "/profile",
            labelKey: "more.profile" as const,
            descKey: "more.profileDesc" as const,
            icon: User,
        },
        {
            href: "/settings",
            labelKey: "more.settings" as const,
            descKey: "more.settingsDesc" as const,
            icon: Settings,
        },
    ];

    return (
        <UserShell titleKey="pages.more" descriptionKey="pages.moreDesc">
            <div className="space-y-2">
                {links.map(({ href, labelKey, descKey, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)]/80 bg-[var(--color-card)] px-4 py-3.5 shadow-[var(--shadow-soft)] transition-[transform,background-color,border-color] duration-200 active:scale-[0.99] hover:border-[var(--color-primary)]/30"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                            <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block font-medium">{t(labelKey)}</span>
                            <span className="block text-xs text-[var(--color-muted-foreground)]">
                                {t(descKey)}
                            </span>
                        </span>
                        <ChevronRight className="rtl-flip h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </Link>
                ))}
            </div>
        </UserShell>
    );
}
