import UserShell from "../components/shell/UserShell";
import { Card, CardContent } from "../components/ui/card";
import Link from "next/link";
import { Calendar, CreditCard, User } from "lucide-react";

const links = [
    { href: "/installments", label: "Installments", icon: Calendar },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: User },
];

export default function MorePage() {
    return (
        <UserShell title="More">
            <div className="space-y-3">
                {links.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href}>
                        <Card>
                            <CardContent className="flex items-center gap-3 py-4">
                                <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                                <span className="font-medium">{label}</span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </UserShell>
    );
}
