'use client';

import BottomNav from "./BottomNav";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    title?: string;
    hideNav?: boolean;
};

export default function UserShell({ children, title, hideNav }: Props) {
    return (
        <div className="flex min-h-dvh flex-col">
            <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                <h1 className="text-lg font-semibold">{title ?? "Next Financial"}</h1>
            </header>
            <main className={hideNav ? "flex-1 px-4 py-4" : "flex-1 px-4 py-4 pb-24"}>
                {children}
            </main>
            {!hideNav && <BottomNav />}
        </div>
    );
}
