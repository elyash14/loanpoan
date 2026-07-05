'use client';

import { cn } from "utils/cn";
import { Home, Landmark, MoreHorizontal, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/accounts", label: "Accounts", icon: Wallet },
    { href: "/loans", label: "Loans", icon: Landmark },
    { href: "/more", label: "More", icon: MoreHorizontal },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-card)] pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
                {tabs.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(`${href}/`);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs",
                                active
                                    ? "text-[var(--color-primary)]"
                                    : "text-[var(--color-muted-foreground)]",
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
