'use client';

import { cn } from "utils/cn";
import { formatMoney } from "utils/formatMoney";
import { ChevronRight, Wallet } from "lucide-react";
import { LoanIcon } from "../../components/icons/LoanIcon";
import Link from "next/link";
import dayjs from "dayjs";

export type AccountCardData = {
    id: number;
    code: string;
    name: string | null;
    balance: string;
    openedAt: string | null;
    loans: {
        id: number;
        amount: string;
        status: "IN_PROGRESS" | "FINISHED";
    }[];
};

type Props = {
    account: AccountCardData;
};

export default function AccountCard({ account }: Props) {
    const balance = Number(account.balance ?? 0);
    const isPositive = balance > 0;
    const hasActiveLoan = account.loans.some((loan) => loan.status === "IN_PROGRESS");

    return (
        <Link
            href={`/accounts/${account.id}`}
            className="group block focus-visible:outline-none"
        >
            <article
                className={cn(
                    "relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)]/70",
                    "bg-[var(--color-card)] p-4 shadow-[var(--shadow-soft)]",
                    "transition-[transform,border-color,box-shadow] duration-200 ease-out",
                    "hover:border-[var(--color-primary)]/35 hover:shadow-[0_12px_40px_hsl(217_91%_60%_/0.12)]",
                    "active:scale-[0.99]",
                    "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
                )}
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[var(--color-primary)]/15 blur-2xl transition-opacity duration-200 group-hover:opacity-100"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/50 to-transparent"
                />

                <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <span
                            className={cn(
                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)]",
                                "bg-[var(--color-primary)]/12 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20",
                            )}
                        >
                            <Wallet className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                                Account
                            </p>
                            <h3 className="truncate text-base font-semibold tracking-tight">
                                {account.code}
                            </h3>
                            {account.name ? (
                                <p className="truncate text-sm text-[var(--color-muted-foreground)]">
                                    {account.name}
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <ChevronRight
                        className="mt-1 h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                        strokeWidth={1.75}
                    />
                </div>

                <div className="relative mt-4 border-t border-[var(--color-border)]/60 pt-4">
                    <p className="text-xs text-[var(--color-muted-foreground)]">Balance</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                        <p
                            className={cn(
                                "text-xl font-semibold tracking-tight tabular-nums",
                                isPositive ? "text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)]",
                            )}
                        >
                            {formatMoney(account.balance)}
                        </p>
                        {hasActiveLoan ? (
                            <span
                                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--color-muted-foreground)]"
                                title="This account has an active loan"
                            >
                                <LoanIcon className="h-5 w-5 text-[var(--color-accent)]" />
                                <span>On loan</span>
                            </span>
                        ) : null}
                    </div>
                </div>

                {account.openedAt ? (
                    <p className="relative mt-3 text-xs text-[var(--color-muted-foreground)]">
                        Opened {dayjs(account.openedAt).format("MMM D, YYYY")}
                    </p>
                ) : null}
            </article>
        </Link>
    );
}
