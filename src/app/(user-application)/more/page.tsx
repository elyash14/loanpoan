import UserShell from "../components/shell/UserShell";
import Link from "next/link";
import { Calendar, ChevronRight, CreditCard, User } from "lucide-react";

const links = [
    { href: "/installments", label: "Installments", description: "Upcoming and paid schedules", icon: Calendar },
    { href: "/payments", label: "Payments", description: "Payment history and status", icon: CreditCard },
    { href: "/profile", label: "Profile", description: "Account and security", icon: User },
];

export default function MorePage() {
    return (
        <UserShell title="More" description="Shortcuts and settings">
            <div className="space-y-2">
                {links.map(({ href, label, description, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)]/80 bg-[var(--color-card)] px-4 py-3.5 shadow-[var(--shadow-soft)] transition-[transform,background-color,border-color] duration-200 active:scale-[0.99] hover:border-[var(--color-primary)]/30"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                            <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block font-medium">{label}</span>
                            <span className="block text-xs text-[var(--color-muted-foreground)]">
                                {description}
                            </span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                ))}
            </div>
        </UserShell>
    );
}
