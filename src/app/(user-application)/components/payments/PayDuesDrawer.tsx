'use client';

import { useEffect, useMemo, useState } from "react";
import { getUserPayableDues, type PayableDueItem } from "@database/user-panel/data";
import { useUserPreferences } from "../preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../preferences/useLocaleFormat";
import BottomDrawer from "../ui/BottomDrawer";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Money from "../preferences/Money";
import PaymentSubmissionDrawer from "./PaymentSubmissionDrawer";
import { cn } from "utils/cn";
import { CalendarClock, Loader2 } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

export default function PayDuesDrawer({ open, onClose, onSuccess }: Props) {
    const { t } = useUserPreferences();
    const { formatDate } = useLocaleFormat();
    const [dues, setDues] = useState<PayableDueItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedInstallments, setSelectedInstallments] = useState<Set<number>>(new Set());
    const [selectedPayments, setSelectedPayments] = useState<Set<number>>(new Set());
    const [receiptOpen, setReceiptOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        setLoading(true);
        setError(null);
        setSelectedInstallments(new Set());
        setSelectedPayments(new Set());
        setReceiptOpen(false);

        getUserPayableDues()
            .then((items) => setDues(items))
            .catch(() => setError(t("receipt.loadDuesFailed")))
            .finally(() => setLoading(false));
    }, [open, t]);

    const selectedItems = useMemo(() => {
        return dues.filter((item) =>
            item.kind === "installment"
                ? selectedInstallments.has(item.id)
                : selectedPayments.has(item.id),
        );
    }, [dues, selectedInstallments, selectedPayments]);

    const totalAmount = useMemo(
        () => selectedItems.reduce((sum, item) => sum + Number(item.amount), 0),
        [selectedItems],
    );

    const toggleItem = (item: PayableDueItem) => {
        if (item.kind === "installment") {
            setSelectedInstallments((current) => {
                const next = new Set(current);
                if (next.has(item.id)) next.delete(item.id);
                else next.add(item.id);
                return next;
            });
        } else {
            setSelectedPayments((current) => {
                const next = new Set(current);
                if (next.has(item.id)) next.delete(item.id);
                else next.add(item.id);
                return next;
            });
        }
    };

    const isSelected = (item: PayableDueItem) =>
        item.kind === "installment"
            ? selectedInstallments.has(item.id)
            : selectedPayments.has(item.id);

    const statusBadge = (status: "overdue" | "upcoming") => {
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

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    const handleContinue = () => {
        if (selectedItems.length === 0) return;
        setReceiptOpen(true);
    };

    const handleReceiptSuccess = () => {
        setReceiptOpen(false);
        onSuccess?.();
        onClose();
    };

    return (
        <>
            <BottomDrawer
                open={open && !receiptOpen}
                onClose={handleClose}
                title={t("receipt.selectItems")}
                description={t("home.noticeHint")}
            >
                <div className="space-y-3 pt-1">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("common.loading")}
                        </div>
                    ) : error ? (
                        <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </p>
                    ) : dues.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            {t("receipt.noPayableDues")}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {dues.map((item) => {
                                const selected = isSelected(item);
                                const badge = statusBadge(item.status);
                                const typeLabel =
                                    item.kind === "installment"
                                        ? t("receipt.dueInstallment")
                                        : t("receipt.dueLoanPayment");

                                return (
                                    <button
                                        key={`${item.kind}-${item.id}`}
                                        type="button"
                                        onClick={() => toggleItem(item)}
                                        className={cn(
                                            "w-full rounded-2xl border border-border/70 bg-card p-3.5 text-start transition-all active:scale-[0.99]",
                                            selected && "border-primary/50 bg-primary/5 ring-2 ring-primary/30",
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-start gap-2.5">
                                                <span
                                                    className={cn(
                                                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/45",
                                                        selected && "border-primary bg-primary",
                                                    )}
                                                >
                                                    {selected ? (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                                                    ) : null}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold">{item.accountCode}</p>
                                                    <p className="text-[11px] text-muted-foreground">{typeLabel}</p>
                                                    {item.kind === "installment" && item.accountName ? (
                                                        <p className="truncate text-[11px] text-muted-foreground">
                                                            {item.accountName}
                                                        </p>
                                                    ) : null}
                                                    {item.kind === "payment" ? (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            #{item.loanId}
                                                        </p>
                                                    ) : null}
                                                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                                                        {formatDate(item.dueDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                                                <Badge className={cn("text-[10px] font-medium", badge.className)}>
                                                    {badge.label}
                                                </Badge>
                                                <Money value={item.amount} className="text-base font-bold" />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {selectedItems.length > 0 ? (
                        <div className="sticky bottom-0 -mx-1 border-t border-border/50 bg-card/95 pt-3 backdrop-blur-sm">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <span className="text-sm text-muted-foreground">
                                    {t("receipt.paySelected", { count: selectedItems.length })}
                                </span>
                                <Money value={String(totalAmount)} className="text-lg font-bold text-primary" />
                            </div>
                            <Button
                                type="button"
                                className="w-full rounded-xl font-semibold"
                                onClick={handleContinue}
                            >
                                {t("receipt.continueToReceipt")}
                            </Button>
                        </div>
                    ) : null}
                </div>
            </BottomDrawer>

            <PaymentSubmissionDrawer
                open={receiptOpen}
                onClose={() => setReceiptOpen(false)}
                selectedInstallments={Array.from(selectedInstallments)}
                selectedPayments={Array.from(selectedPayments)}
                totalAmount={totalAmount}
                onSuccess={handleReceiptSuccess}
            />
        </>
    );
}
