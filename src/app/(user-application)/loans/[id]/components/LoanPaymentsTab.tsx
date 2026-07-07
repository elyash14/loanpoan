'use client';

import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";
import { formatMoney } from "utils/formatMoney";
import dayjs from "dayjs";
import "dayjs/locale/fa";
import type { LoanDetailData } from "./types";

type PaymentFilter = "all" | "paid" | "unpaid" | "overdue";

type Props = {
    loan: LoanDetailData;
    filter: PaymentFilter;
    onFilterChange: (next: PaymentFilter) => void;
};

export default function LoanPaymentsTab({ loan, filter, onFilterChange }: Props) {
    const { t, locale } = useUserPreferences();
    const now = new Date();

    const withStatus = loan.payments.map((payment) => {
        const isPaid = Boolean(payment.paidAt);
        const isOverdue = !isPaid && new Date(payment.dueDate) < now;
        const status = isPaid ? "paid" : isOverdue ? "overdue" : "unpaid";
        return { ...payment, status };
    });

    const filtered = withStatus
        .filter((payment) => filter === "all" || payment.status === filter)
        .sort((a, b) => {
            return +new Date(b.dueDate) - +new Date(a.dueDate);
        });

    const filterOptions: { key: PaymentFilter; label: string }[] = [
        { key: "all", label: t("status.all") },
        { key: "paid", label: t("status.paid") },
        { key: "unpaid", label: t("status.unpaid") },
        { key: "overdue", label: t("status.overdue") },
    ];

    const badgeVariant = (status: PaymentFilter) => {
        if (status === "paid") return "secondary" as const;
        if (status === "overdue") return "destructive" as const;
        return "outline" as const;
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
                {filterOptions.map((opt) => (
                    <button
                        key={opt.key}
                        type="button"
                        onClick={() => onFilterChange(opt.key)}
                        className={
                            filter === opt.key
                                ? "rounded-full border border-primary/70 bg-primary/15 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                                : "rounded-full border border-border bg-transparent px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                        }
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {filtered.length ? filtered.map((payment) => (
                <Card key={payment.id}>
                    <CardContent className="space-y-2 py-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold tabular-nums">{formatMoney(payment.amount)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {t("loans.due", { date: dayjs(payment.dueDate).locale(locale).format("YYYY-MM-DD") })}
                                </p>
                                {payment.paidAt ? (
                                    <p className="text-xs text-muted-foreground">
                                        {t("status.paid")}: {dayjs(payment.paidAt).locale(locale).format("YYYY-MM-DD")}
                                    </p>
                                ) : null}
                            </div>
                            <Badge variant={badgeVariant(payment.status as PaymentFilter)}>
                                {payment.status === "paid"
                                    ? t("status.paid")
                                    : payment.status === "overdue"
                                        ? t("status.overdue")
                                        : t("status.unpaid")}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )) : (
                <p className="text-sm text-muted-foreground">{t("common.noResults")}</p>
            )}
        </div>
    );
}
