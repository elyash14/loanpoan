'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { LoanIcon } from "../../components/icons/LoanIcon";
import LoadMoreButton from "../../components/LoadMoreButton";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import Money from "../../components/preferences/Money";
import { loadMoreUserPayments } from "@database/user-panel/data";
import { cn } from "utils/cn";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PaymentRow = {
    id: number;
    amount: string;
    dueDate: string;
    paidAt: string | null;
    loan: { id: number; account: { id: number; code: string; name: string | null } };
};

type PaymentStatus = "paid" | "unpaid" | "overdue";

type Summary = {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
    upcoming: number;
};

function getPaymentStatus(row: PaymentRow): PaymentStatus {
    if (row.paidAt) return "paid";
    if (new Date(row.dueDate) < new Date()) return "overdue";
    return "unpaid";
}

type Props = {
    payments: string;
    summary: string;
    total: number;
    hasMore: boolean;
    status: string;
    search: string;
    sortBy: string;
    sortDir: "+" | "-";
    loanId?: number;
};

export default function PaymentsList({
    payments,
    summary,
    total,
    hasMore: initialHasMore,
    status,
    search,
    sortBy,
    sortDir,
    loanId,
}: Props) {
    const { t } = useUserPreferences();
    const { formatDate, formatNumber, formatDigits } = useLocaleFormat();
    const initialRows = useMemo(() => JSON.parse(payments) as PaymentRow[], [payments]);
    const stats = useMemo(() => JSON.parse(summary) as Summary, [summary]);
    const [rows, setRows] = useState(initialRows);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setRows(initialRows);
        setPage(1);
        setHasMore(initialHasMore);
    }, [payments, initialHasMore, initialRows]);

    const statusInfo = (paymentStatus: PaymentStatus) => {
        if (paymentStatus === "paid") {
            return {
                label: t("status.paid"),
                className: "border border-emerald-400/25 bg-emerald-500/15 text-emerald-300",
            };
        }
        if (paymentStatus === "overdue") {
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

    const handleLoadMore = async () => {
        const nextPage = page + 1;
        setLoading(true);
        try {
            const result = await loadMoreUserPayments({
                page: nextPage,
                status,
                search,
                sortBy,
                sortDir,
                loanId,
            });
            setRows((current) => [...current, ...result.data]);
            setPage(nextPage);
            setHasMore(result.hasMore);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3.5 pb-2">
            <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]">
                <CardHeader className="pb-0">
                    <CardTitle className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        {t("payments.summaryTitle")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 pt-3">
                    <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                            {t("payments.summaryTotal")}
                        </p>
                        <p className="text-lg font-semibold tabular-nums leading-6">{formatNumber(stats.total)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                            {t("payments.summaryPaid")}
                        </p>
                        <p className="text-lg font-semibold tabular-nums leading-6">{formatNumber(stats.paid)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/25 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                            {t("payments.summaryOverdue")}
                        </p>
                        <p className="text-lg font-semibold tabular-nums leading-6 text-rose-300">
                            {formatNumber(stats.overdue)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {!rows.length ? (
                <p className="text-sm text-muted-foreground">{t("payments.empty")}</p>
            ) : (
                rows.map((row) => {
                    const paymentStatus = getPaymentStatus(row);
                    const badge = statusInfo(paymentStatus);

                    return (
                        <Card key={row.id} className="relative overflow-hidden border-border/70">
                            <CardContent className="space-y-2.5 py-3.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <Link
                                            href={`/loans/${row.loan.id}`}
                                            className="inline-flex items-center gap-1.5 truncate text-base font-semibold tracking-tight hover:text-primary"
                                        >
                                            <LoanIcon className="h-4 w-4 shrink-0 text-primary" />
                                            {row.loan.account.code}
                                        </Link>
                                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                                            #{formatDigits(row.loan.id)}
                                        </p>
                                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                                            {t("payments.due", { date: formatDate(row.dueDate) })}
                                        </p>
                                        {row.paidAt ? (
                                            <p className="text-[11px] text-muted-foreground">
                                                {t("payments.paidAt", { date: formatDate(row.paidAt) })}
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

            {rows.length > 0 && total > rows.length ? (
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
