'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import Link from "next/link";
import SimplePagination from "../../components/SimplePagination";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

type LoanRow = {
    id: number;
    amount: string;
    status: string;
    createdAt: string;
    account: { id: number; code: string };
};

type Props = {
    loans: string;
    totalPages: number;
    currentPage: number;
    searchParams: Record<string, string>;
};

export default function LoansList({ loans, totalPages, currentPage, searchParams }: Props) {
    const { t } = useUserPreferences();
    const { formatMoney, formatNumber, formatDate, formatDigits } = useLocaleFormat();
    const rows = useMemo(() => JSON.parse(loans) as LoanRow[], [loans]);
    const activeLoans = rows.filter((row) => row.status === "IN_PROGRESS").length;
    const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount), 0);

    if (!rows.length) {
        return <p className="text-sm text-muted-foreground">{t("loans.empty")}</p>;
    }

    const statusInfo = (status: string) => {
        if (status === "IN_PROGRESS") {
            return {
                label: t("status.inProgress"),
                className: "border border-emerald-400/25 bg-emerald-500/15 text-emerald-300",
            };
        }
        if (status === "FINISHED") {
            return {
                label: t("status.finished"),
                className: "border border-sky-400/20 bg-sky-500/10 text-sky-200",
            };
        }
        return {
            label: t("status.overdue"),
            className: "border border-rose-400/25 bg-rose-500/15 text-rose-200",
        };
    };

    return (
        <div className="space-y-3.5 pb-2">
            <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        {t("loans.summaryTitle")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 pt-3">
                    <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t("loans.summaryTotal")}</p>
                        <p className="text-lg font-semibold tabular-nums leading-6">{formatNumber(rows.length)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t("loans.summaryActive")}</p>
                        <p className="text-lg font-semibold tabular-nums leading-6">{formatNumber(activeLoans)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t("loans.summaryAmount")}</p>
                        <p className="truncate text-lg font-semibold tabular-nums leading-6">{formatMoney(totalAmount)}</p>
                    </div>
                </CardContent>
            </Card>

            {rows.map((loan) => (
                <Link key={loan.id} href={`/loans/${loan.id}`} className="group block focus-visible:outline-none">
                    <Card
                        className="
                            relative overflow-hidden border-border/70
                            transition-[transform,border-color,box-shadow] duration-200 ease-out
                            hover:border-(--color-primary)/35 hover:shadow-[0_12px_40px_hsl(217_91%_60%_/0.12)]
                            active:scale-[0.99]
                            focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-background
                        "
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-(--color-primary)/15 blur-2xl transition-opacity duration-200 group-hover:opacity-100"
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--color-primary)/50 to-transparent"
                        />

                        <CardContent className="relative space-y-2.5 py-3.5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-base font-semibold tracking-tight">{loan.account.code}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {t("loans.createdAt")}: {formatDate(loan.createdAt)}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">#{formatDigits(loan.id)}</p>
                                </div>
                                <Badge className={`shrink-0 text-xs font-medium ${statusInfo(loan.status).className}`}>
                                    {statusInfo(loan.status).label}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2">
                                <p className="shrink-0 text-2xl font-bold tabular-nums tracking-tight">{formatMoney(loan.amount)}</p>
                                <ChevronRight className="h-4 w-4 text-muted-foreground rtl-flip transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 group-hover:text-(--color-primary)" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/loans"
                searchParams={searchParams}
            />
        </div>
    );
}
