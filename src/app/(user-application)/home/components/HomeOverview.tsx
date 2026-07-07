'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { LoanIcon } from "../../components/icons/LoanIcon";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import Money from "../../components/preferences/Money";
import Link from "next/link";
import { useMemo } from "react";
import {
    Award,
    CalendarClock,
    Trophy,
    Wallet,
    WalletCards,
} from "lucide-react";
import { cn } from "utils/cn";

export type HomeDashboardData = {
    totalBalance: string;
    notice: {
        overdueCount: number;
        overdueAmount: string;
        upcomingCount: number;
        upcomingAmount: string;
        nextDue: { dueDate: string; amount: string } | null;
    };
    activeLoan: {
        id: number;
        accountCode: string;
        accountId: number;
        amount: string;
        paidCount: number;
        paymentCount: number;
        progressPercent: number;
        remainingAmount: string;
    } | null;
    queue: {
        position: number;
        totalEligible: number;
    } | null;
    punctualityScore: number;
};

type Props = {
    fullName: string;
    dashboard: string;
};

function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default function HomeOverview({ fullName, dashboard }: Props) {
    const { t } = useUserPreferences();
    const { formatMoney, formatNumber, formatPercent, formatDate } = useLocaleFormat();
    const data = useMemo(() => JSON.parse(dashboard) as HomeDashboardData, [dashboard]);

    const hasNotice = data.notice.overdueCount > 0 || data.notice.upcomingCount > 0;
    const punctualityPositive = data.punctualityScore > 0;
    const punctualityNegative = data.punctualityScore < 0;
    const punctualityLabel = punctualityPositive
        ? `+${formatNumber(data.punctualityScore)}`
        : formatNumber(data.punctualityScore);

    const quickActions = [
        { href: "/accounts", labelKey: "pages.accounts" as const, icon: Wallet },
        { href: "/loans", labelKey: "pages.loans" as const, icon: LoanIcon },
        { href: "/installments?from=home", labelKey: "pages.installments" as const, icon: CalendarClock },
        { href: "/payments?from=home", labelKey: "pages.payments" as const, icon: WalletCards },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-1 ring-primary/25">
                    {initialsFromName(fullName)}
                </span>
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{t("home.welcome")}</p>
                    <h2 className="truncate text-xl font-semibold tracking-tight">{fullName}</h2>
                </div>
            </div>

            <Card className="overflow-hidden">
                <CardContent className="space-y-4 pt-5">
                    <div>
                        <p className="text-xs text-muted-foreground">{t("home.totalBalance")}</p>
                        <p className="mt-1 text-3xl font-bold tracking-tight">
                            <Money value={data.totalBalance} />
                        </p>
                    </div>

                    {data.activeLoan ? (
                        <div className="rounded-md bg-muted/30 px-3 py-2">
                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <LoanIcon className="h-3.5 w-3.5 text-primary" />
                                    {t("home.activeLoanProgress")} · {data.activeLoan.accountCode}
                                </span>
                                <span>{formatPercent(data.activeLoan.progressPercent)}</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-muted">
                                <div
                                    className="h-2 rounded-full bg-primary transition-[width] duration-300"
                                    style={{ width: `${data.activeLoan.progressPercent}%` }}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                                <span className="text-muted-foreground">
                                    {formatNumber(data.activeLoan.paidCount)}/{formatNumber(data.activeLoan.paymentCount)}
                                </span>
                                <span className="font-medium">
                                    {t("home.remainingAmount")}: <Money value={data.activeLoan.remainingAmount} />
                                </span>
                            </div>
                            <Link
                                href={`/loans/${data.activeLoan.id}`}
                                className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
                            >
                                {t("common.view")}
                            </Link>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {hasNotice ? (
                <Link href="/installments?from=home" className="block">
                    <Card className="border-destructive/30 transition-colors hover:bg-destructive/5">
                        <CardContent className="space-y-2 py-4">
                            {data.notice.overdueCount > 0 ? (
                                <p className="text-sm font-semibold text-destructive">
                                    {t("home.noticeOverdue", {
                                        count: formatNumber(data.notice.overdueCount),
                                        amount: formatMoney(data.notice.overdueAmount),
                                    })}
                                </p>
                            ) : null}
                            {data.notice.upcomingCount > 0 ? (
                                <p className="text-sm font-medium">
                                    {t("home.noticeUpcoming", {
                                        count: formatNumber(data.notice.upcomingCount),
                                        amount: formatMoney(data.notice.upcomingAmount),
                                    })}
                                </p>
                            ) : null}
                            {data.notice.nextDue ? (
                                <p className="text-xs text-muted-foreground">
                                    {t("home.nextDue", {
                                        date: formatDate(data.notice.nextDue.dueDate),
                                        amount: formatMoney(data.notice.nextDue.amount),
                                    })}
                                </p>
                            ) : null}
                            <p className="text-xs text-muted-foreground">{t("home.noticeHint")}</p>
                        </CardContent>
                    </Card>
                </Link>
            ) : null}

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Trophy className="h-4 w-4 text-primary" />
                        {t("home.punctualityScore")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.queue ? (
                        <div className="rounded-md bg-muted/30 px-3 py-2">
                            <p className="text-sm font-semibold">
                                {t("home.queuePosition", {
                                    position: formatNumber(data.queue.position),
                                    total: formatNumber(data.queue.totalEligible),
                                })}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{t("home.queueEligibleNote")}</p>
                        </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2">
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">{t("home.punctualityHint")}</p>
                        </div>
                        <Badge
                            className={cn(
                                "shrink-0 px-2.5 py-1 text-sm font-bold tabular-nums",
                                punctualityPositive && "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
                                punctualityNegative && "border-rose-500/40 bg-rose-500/10 text-rose-600",
                                !punctualityPositive && !punctualityNegative && "border-border bg-muted/40 text-muted-foreground",
                            )}
                        >
                            <Award className="me-1 inline h-3.5 w-3.5" />
                            {punctualityLabel}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("home.quickActions")}</p>
                <Card className="p-2">
                    <div className="grid grid-cols-2 gap-2">
                        {quickActions.map(({ href, labelKey, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-muted/40"
                            >
                                <Icon className="h-4 w-4 shrink-0 text-primary" />
                                <span className="truncate">{t(labelKey)}</span>
                            </Link>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
