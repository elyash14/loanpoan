'use client';

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LoadMoreButton from "../../components/LoadMoreButton";
import Money from "../../components/preferences/Money";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import { loadMoreUserLoans } from "@database/user-panel/data";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

type LoanRow = {
    id: number;
    amount: string;
    status: string;
    createdAt: string;
    account: { id: number; code: string };
};

type Props = {
    loans: string;
    total: number;
    hasMore: boolean;
    search: string;
    sortBy: string;
    sortDir: "+" | "-";
    status: string;
};

export default function LoansList({
    loans,
    total,
    hasMore: initialHasMore,
    search,
    sortBy,
    sortDir,
    status,
}: Props) {
    const { t } = useUserPreferences();
    const { formatNumber, formatDate, formatDigits } = useLocaleFormat();
    const initialRows = useMemo(() => JSON.parse(loans) as LoanRow[], [loans]);
    const [rows, setRows] = useState(initialRows);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setRows(initialRows);
        setPage(1);
        setHasMore(initialHasMore);
    }, [loans, initialHasMore, initialRows]);

    const activeLoans = rows.filter((row) => row.status === "IN_PROGRESS").length;
    const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount), 0);

    const handleLoadMore = async () => {
        const nextPage = page + 1;
        setLoading(true);
        try {
            const result = await loadMoreUserLoans({
                page: nextPage,
                search,
                sortBy,
                sortDir,
                status: status || undefined,
            });
            setRows((current) => [...current, ...result.data]);
            setPage(nextPage);
            setHasMore(result.hasMore);
        } finally {
            setLoading(false);
        }
    };

    if (!rows.length) {
        return <p className="text-sm text-muted-foreground">{t("loans.empty")}</p>;
    }

    const statusInfo = (loanStatus: string) => {
        if (loanStatus === "IN_PROGRESS") {
            return {
                label: t("status.inProgress"),
                className: "border border-emerald-400/25 bg-emerald-500/15 text-emerald-300",
            };
        }
        if (loanStatus === "FINISHED") {
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
                    <div className="col-span-1 flex min-w-0 flex-col gap-2">
                        <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t("loans.summaryTotal")}</p>
                            <p className="text-lg font-semibold tabular-nums leading-6">{formatNumber(total)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t("loans.summaryActive")}</p>
                            <p className="text-lg font-semibold tabular-nums leading-6">{formatNumber(activeLoans)}</p>
                        </div>
                    </div>
                    <div className="col-span-2 flex min-w-0 flex-col justify-center rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t("loans.summaryAmount")}</p>
                        <Money value={totalAmount} className="mt-0.5 text-xl font-semibold leading-tight" />
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
                                <Money value={loan.amount} className="shrink-0 text-2xl font-bold tracking-tight" />
                                <ChevronRight className="h-4 w-4 text-muted-foreground rtl-flip transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 group-hover:text-(--color-primary)" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}

            {total > rows.length ? (
                <p className="text-center text-xs text-muted-foreground">
                    {t("common.showingCount", {
                        shown: formatNumber(rows.length),
                        total: formatNumber(total),
                    })}
                </p>
            ) : null}

            <LoadMoreButton hasMore={hasMore} loading={loading} onClick={handleLoadMore} />
        </div>
    );
}
