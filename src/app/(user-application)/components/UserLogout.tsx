'use client';

import { logout } from "@database/user/actions";
import { ChevronRight, LogOut } from "lucide-react";

type Props = {
    label?: string;
    description?: string;
};

export default function UserLogout({
    label = "Log out",
    description,
}: Props) {
    return (
        <button
            type="button"
            onClick={() => logout()}
            className="group flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-1 py-3 text-start transition-[background-color,transform] duration-200 hover:bg-destructive/8 active:scale-[0.99]"
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-destructive/12 text-destructive">
                <LogOut className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block font-medium text-destructive">{label}</span>
                {description ? (
                    <span className="block text-xs text-muted-foreground">{description}</span>
                ) : null}
            </span>
            <ChevronRight className="rtl-flip h-4 w-4 shrink-0 text-destructive/50 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </button>
    );
}
