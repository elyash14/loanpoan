'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatMoney } from "utils/formatMoney";
import Link from "next/link";
import { useMemo } from "react";
import dayjs from "dayjs";

type Stats = {
    totalBalance: string;
    totals: { loans: string; payments: string; installments: string };
    overdue: { loans: string; payments: string; installments: string };
};

type Related = {
    accountsCount: number;
    loansCount: number;
    installmentsCount: number;
    installmentsPaidCount: number;
};

type SystemStats = {
    userCount: number;
    accountCount: number;
    loanCount: number;
    currentInstallmentAmount: string;
};

type Props = {
    fullName: string;
    stats: string;
    related: string;
    systemStats: string;
};

export default function HomeOverview({ fullName, stats, related, systemStats }: Props) {
    const parsedStats = useMemo(() => JSON.parse(stats) as Stats, [stats]);
    const parsedRelated = useMemo(() => JSON.parse(related) as Related, [related]);
    const parsedSystem = useMemo(() => JSON.parse(systemStats) as SystemStats, [systemStats]);

    const cards = [
        { label: "Balance", value: parsedStats.totalBalance, href: "/accounts" },
        { label: "Loans", value: parsedStats.totals.loans, href: "/loans", count: parsedRelated.loansCount },
        { label: "Installments", value: parsedStats.totals.installments, href: "/installments", count: parsedRelated.installmentsCount },
        { label: "Payments", value: parsedStats.totals.payments, href: "/payments" },
    ];

    const overdueCards = [
        { label: "Overdue loans", value: parsedStats.overdue.loans, href: "/loans?status=Overdue" },
        { label: "Overdue payments", value: parsedStats.overdue.payments, href: "/payments?status=Overdue" },
        { label: "Overdue installments", value: parsedStats.overdue.installments, href: "/installments?status=Overdue" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">Welcome back</p>
                <h2 className="text-xl font-semibold">{fullName}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {cards.map((card) => (
                    <Link key={card.href} href={card.href}>
                        <Card className="transition hover:border-[var(--color-primary)]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">
                                    {card.label}
                                    {"count" in card && card.count != null ? (
                                        <Badge className="ml-2" variant="secondary">{card.count}</Badge>
                                    ) : null}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-semibold tabular-nums">{formatMoney(card.value)}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div>
                <h3 className="mb-3 text-sm font-medium text-[var(--color-muted-foreground)]">Overdue</h3>
                <div className="space-y-2">
                    {overdueCards.map((card) => (
                        <Link key={card.href} href={card.href}>
                            <Card className="border-[var(--color-destructive)]/30">
                                <CardContent className="flex items-center justify-between py-3">
                                    <span className="text-sm">{card.label}</span>
                                    <span className="font-semibold tabular-nums text-[var(--color-destructive)]">
                                        {formatMoney(card.value)}
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">System overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                    <p>Active members: {parsedSystem.userCount}</p>
                    <p>Accounts in system: {parsedSystem.accountCount}</p>
                    <p>Loans in system: {parsedSystem.loanCount}</p>
                    <p>Standard installment: {formatMoney(parsedSystem.currentInstallmentAmount)}</p>
                    <p className="text-xs">Updated {dayjs().format("YYYY-MM-DD")}</p>
                </CardContent>
            </Card>
        </div>
    );
}
