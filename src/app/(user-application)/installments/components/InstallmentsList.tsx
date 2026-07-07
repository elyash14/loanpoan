'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import Money from "../../components/preferences/Money";
import SimplePagination from "../../components/SimplePagination";
import { cn } from "utils/cn";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

type InstallmentRow = {
    id: number;
    amount: string;
    dueDate: string;
    paidAt: string | null;
    account: { id: number; code: string; name: string | null };
};

type InstallmentStatus = "paid" | "unpaid" | "overdue";

type Summary = {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
    upcoming: number;
};

function getInstallmentStatus(row: InstallmentRow): InstallmentStatus {
    if (row.paidAt) return "paid";
    if (new Date(row.dueDate) < new Date()) return "overdue";
    return "unpaid";
}

type Props = {
    installments: string;
    summary: string;
    totalPages: number;
    currentPage: number;
    searchParams: Record<string, string>;
};

export default function InstallmentsList({
    installments,
    summary,
    totalPages,
    currentPage,
    searchParams,
}: Props) {
    const { t } = useUserPreferences();
    const { formatDate, formatNumber } = useLocaleFormat();
    const rows = useMemo(() => JSON.parse(installments) as InstallmentRow[], [installments]);
    const stats = useMemo(() => JSON.parse(summary) as Summary, [summary]);

    const statusInfo = (status: InstallmentStatus) => {
        if (status === "paid") {
            return {
                label: t("status.paid"),
                className: "border border-emerald-400/25 bg-emerald-500/15 text-emerald-300",
            };
        }
        if (status === "overdue") {
            return {
                label: t("status.overdue"),
                className: "border border-rose-400/25 bg-rose-500/15 text-rose-200",
            };
        }
        return {
            label: t("status.unpaid"),
            className: "border border-sky-400/20 bg-sky-500/10 text-sky-200",
        };
    };

    return (
        <div className="space-y-3.5 pb-2">
            <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        {t("installments.summaryTitle")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 pt-3">
                    <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                            {t("installments.summaryTotal")}
                        </p>
                        <p className="text-lg font-semibold tabular-nums leading-6">{formatNumber(stats.total)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                            {t("installments.summaryPaid")}
                        </p>
                        <p className="text-lg font-semibold tabular-nums leading-6">{formatNumber(stats.paid)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                            {t("installments.summaryOverdue")}
                        </p>
                        <p className="text-lg font-semibold tabular-nums leading-6 text-rose-300">
                            {formatNumber(stats.overdue)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {!rows.length ? (
                <p className="text-sm text-muted-foreground">{t("installments.empty")}</p>
            ) : (
                rows.map((row) => {
                    const status = getInstallmentStatus(row);
                    const badge = statusInfo(status);

                    return (
                        <Card
                            key={row.id}
                            className="relative overflow-hidden border-border/70"
                        >
                            <CardContent className="space-y-2.5 py-3.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <Link
                                            href={`/accounts/${row.account.id}`}
                                            className="truncate text-base font-semibold tracking-tight hover:text-primary"
                                        >
                                            {row.account.code}
                                        </Link>
                                        {row.account.name ? (
                                            <p className="truncate text-[11px] text-muted-foreground">
                                                {row.account.name}
                                            </p>
                                        ) : null}
                                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                                            {t("installments.due", { date: formatDate(row.dueDate) })}
                                        </p>
                                        {row.paidAt ? (
                                            <p className="text-[11px] text-muted-foreground">
                                                {t("installments.paidAt", { date: formatDate(row.paidAt) })}
                                            </p>
                                        ) : null}
                                    </div>
                                    <Badge className={cn("shrink-0 text-xs font-medium", badge.className)}>
                                        {badge.label}
                                    </Badge>
                                </div>
                                <div className="border-t border-border/40 pt-2">
                                    <Money value={row.amount} className="text-xl font-bold tracking-tight" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            )}

            <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/installments"
                searchParams={searchParams}
            />
        </div>
    );
}
