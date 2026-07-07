'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { LoanIcon } from "../../components/icons/LoanIcon";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
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
    const { t } = useUserPreferences();
    const parsedStats = useMemo(() => JSON.parse(stats) as Stats, [stats]);
    const parsedRelated = useMemo(() => JSON.parse(related) as Related, [related]);
    const parsedSystem = useMemo(() => JSON.parse(systemStats) as SystemStats, [systemStats]);

    const cards = [
        { labelKey: "home.balance" as const, value: parsedStats.totalBalance, href: "/accounts" },
        { labelKey: "home.loans" as const, value: parsedStats.totals.loans, href: "/loans", count: parsedRelated.loansCount, icon: LoanIcon },
        { labelKey: "home.installments" as const, value: parsedStats.totals.installments, href: "/installments", count: parsedRelated.installmentsCount },
        { labelKey: "home.payments" as const, value: parsedStats.totals.payments, href: "/payments" },
    ];

    const overdueCards = [
        { labelKey: "home.overdueLoans" as const, value: parsedStats.overdue.loans, href: "/loans?status=Overdue", icon: LoanIcon },
        { labelKey: "home.overduePayments" as const, value: parsedStats.overdue.payments, href: "/payments?status=Overdue" },
        { labelKey: "home.overdueInstallments" as const, value: parsedStats.overdue.installments, href: "/installments?status=Overdue" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t("home.welcome")}</p>
                <h2 className="text-xl font-semibold">{fullName}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {cards.map((card) => (
                    <Link key={card.href} href={card.href}>
                        <Card className="transition hover:border-[var(--color-primary)]">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted-foreground)]">
                                    {"icon" in card && card.icon ? (
                                        <card.icon className="h-4 w-4 text-[var(--color-primary)]" />
                                    ) : null}
                                    {t(card.labelKey)}
                                    {"count" in card && card.count != null ? (
                                        <Badge className="ms-2" variant="secondary">{card.count}</Badge>
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
                <h3 className="mb-3 text-sm font-medium text-[var(--color-muted-foreground)]">{t("home.overdue")}</h3>
                <div className="space-y-2">
                    {overdueCards.map((card) => (
                        <Link key={card.href} href={card.href}>
                            <Card className="border-[var(--color-destructive)]/30">
                                <CardContent className="flex items-center justify-between py-3">
                                    <span className="flex items-center gap-1.5 text-sm">
                                        {"icon" in card && card.icon ? (
                                            <card.icon className="h-4 w-4 text-[var(--color-destructive)]" />
                                        ) : null}
                                        {t(card.labelKey)}
                                    </span>
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
                    <CardTitle className="text-base">{t("home.systemOverview")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
                    <p>{t("home.activeMembers")}: {parsedSystem.userCount}</p>
                    <p>{t("home.accountsInSystem")}: {parsedSystem.accountCount}</p>
                    <p>{t("home.loansInSystem")}: {parsedSystem.loanCount}</p>
                    <p>{t("home.standardInstallment")}: {formatMoney(parsedSystem.currentInstallmentAmount)}</p>
                    <p className="text-xs">{t("home.updated", { date: dayjs().format("YYYY-MM-DD") })}</p>
                </CardContent>
            </Card>
        </div>
    );
}
