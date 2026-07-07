'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import Money from "../../components/preferences/Money";
import SimplePagination from "../../components/SimplePagination";
import { useMemo } from "react";
import dayjs from "dayjs";

type PaymentRow = {
    id: number;
    amount: string;
    dueDate: string;
    paidAt: string | null;
    loan: { account: { code: string } };
};

function paymentStatus(row: PaymentRow): string {
    if (row.paidAt) return "Paid";
    if (dayjs(row.dueDate).isBefore(dayjs())) return "Overdue";
    return "Not paid";
}

type Props = {
    payments: string;
    totalPages: number;
    currentPage: number;
    searchParams: Record<string, string>;
};

export default function PaymentsList({
    payments, totalPages, currentPage, searchParams,
}: Props) {
    const { t } = useUserPreferences();
    const { formatDate } = useLocaleFormat();
    const rows = useMemo(() => JSON.parse(payments) as PaymentRow[], [payments]);

    if (!rows.length) {
        return <p className="text-sm text-[var(--color-muted-foreground)]">No payments found.</p>;
    }

    return (
        <div className="space-y-3">
            {rows.map((row) => {
                const status = paymentStatus(row);
                return (
                    <Card key={row.id}>
                        <CardContent className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium">{row.loan.account.code}</p>
                                <p className="text-xs text-[var(--color-muted-foreground)]">
                                    Due {formatDate(row.dueDate)}
                                </p>
                                <Badge
                                    variant={status === "Overdue" ? "destructive" : "secondary"}
                                    className="mt-1"
                                >
                                    {status}
                                </Badge>
                            </div>
                            <Money value={row.amount} className="font-semibold" />
                        </CardContent>
                    </Card>
                );
            })}
            <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/payments"
                searchParams={searchParams}
            />
        </div>
    );
}
