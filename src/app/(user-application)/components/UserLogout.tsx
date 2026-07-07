'use client';

import { logout } from "@database/user/actions";
import { LogOut } from "lucide-react";

type Props = {
    label?: string;
};

export default function UserLogout({ label = "Log out" }: Props) {
    return (
        <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/15 active:bg-destructive/20"
        >
            <LogOut className="h-4 w-4 shrink-0" />
            {label}
        </button>
    );
}
