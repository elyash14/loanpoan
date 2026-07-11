'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import LoadMoreButton from "../../components/LoadMoreButton";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import Money from "../../components/preferences/Money";
import { loadMoreUserInstallments } from "@database/user-panel/data";
import { cn } from "utils/cn";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import PaymentSubmissionDrawer from "../../components/payments/PaymentSubmissionDrawer";

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
    total: number;
    hasMore: boolean;
    status: string;
    search: string;
    sortBy: string;
    sortDir: "+" | "-";
    accountId?: number;
};

export default function InstallmentsList({
    installments,
    summary,
    total,
    hasMore: initialHasMore,
    status,
    search,
    sortBy,
    sortDir,
    accountId,
}: Props) {
    const { t } = useUserPreferences();
    const { formatDate, formatNumber } = useLocaleFormat();
    const initialRows = useMemo(() => JSON.parse(installments) as InstallmentRow[], [installments]);
    const stats = useMemo(() => JSON.parse(summary) as Summary, [summary]);
    const [rows, setRows] = useState(initialRows);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);
    
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const selectedRows = useMemo(() => rows.filter((r) => selectedIds.has(r.id)), [rows, selectedIds]);
    const totalAmount = useMemo(() => selectedRows.reduce((sum, r) => sum + Number(r.amount), 0), [selectedRows]);

    useEffect(() => {
        setRows(initialRows);
        setPage(1);
        setHasMore(initialHasMore);
        setSelectedIds(new Set());
    }, [installments, initialHasMore, initialRows]);

    const handleLoadMore = async () => {
        const nextPage = page + 1;
        setLoading(true);
        try {
            const result = await loadMoreUserInstallments({
                page: nextPage,
                status,
                search,
                sortBy,
                sortDir,
                accountId,
            });
            setRows((current) => [...current, ...result.data]);
            setPage(nextPage);
            setHasMore(result.hasMore);
        } finally {
            setLoading(false);
        }
    };

    const statusInfo = (installmentStatus: InstallmentStatus) => {
        if (installmentStatus === "paid") {
            return {
                label: t("status.paid"),
                className: "border border-emerald-400/25 bg-emerald-500/15 text-emerald-300",
            };
        }
        if (installmentStatus === "overdue") {
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
                    const installmentStatus = getInstallmentStatus(row);
                    const badge = statusInfo(installmentStatus);
                    const isSelected = selectedIds.has(row.id);

                    return (
                        <Card
                            key={row.id}
                            className={cn(
                                "relative overflow-hidden border-border/70 transition-all duration-200",
                                !row.paidAt && "cursor-pointer active:scale-[0.99]",
                                isSelected && "ring-2 ring-primary border-transparent bg-primary/5"
                            )}
                            onClick={() => {
                                if (row.paidAt) return;
                                setSelectedIds((current) => {
                                    const next = new Set(current);
                                    if (next.has(row.id)) {
                                        next.delete(row.id);
                                    } else {
                                        next.add(row.id);
                                    }
                                    return next;
                                });
                            }}
                        >
                            <CardContent className="space-y-2.5 py-3.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            {!row.paidAt && (
                                                <span 
                                                    className={cn(
                                                        "h-4 w-4 rounded-full border border-muted-foreground/45 flex items-center justify-center transition-colors shrink-0",
                                                        isSelected && "border-primary bg-primary"
                                                    )}
                                                >
                                                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                                                </span>
                                            )}
                                            <Link
                                                href={`/accounts/${row.account.id}`}
                                                className="truncate text-base font-semibold tracking-tight hover:text-primary"
                                                onClick={(e) => {
                                                    // Prevent navigation if clicking card to select
                                                    if (!row.paidAt) {
                                                        e.stopPropagation();
                                                    }
                                                }}
                                            >
                                                {row.account.code}
                                            </Link>
                                        </div>
                                        {row.account.name ? (
                                            <p className={cn("truncate text-[11px] text-muted-foreground", !row.paidAt && "ms-6")}>
                                                {row.account.name}
                                            </p>
                                        ) : null}
                                        <p className={cn("mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground", !row.paidAt && "ms-6")}>
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
                                <div className={cn("border-t border-border/40 pt-2", !row.paidAt && "ps-6")}>
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

            {selectedIds.size > 0 && (
                <div className="fixed inset-x-0 bottom-[calc(4.75rem+max(0.75rem,env(safe-area-inset-bottom)))] z-40 px-5 animate-in slide-in-from-bottom duration-250">
                    <div className="mx-auto max-w-lg rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-sm backdrop-blur-md flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">{t("receipt.total")}</p>
                            <p className="text-lg font-bold text-primary tabular-nums">
                                <Money value={String(totalAmount)} />
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={() => setIsDrawerOpen(true)}
                            className="rounded-xl px-4 py-2 font-semibold bg-primary text-primary-foreground shrink-0 shadow-md active:scale-95 transition-transform"
                        >
                            {t("receipt.paySelected", { count: selectedIds.size })}
                        </Button>
                    </div>
                </div>
            )}

            <PaymentSubmissionDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                selectedInstallments={Array.from(selectedIds)}
                selectedPayments={[]}
                totalAmount={totalAmount}
                onSuccess={() => setSelectedIds(new Set())}
            />
        </div>
    );
}
