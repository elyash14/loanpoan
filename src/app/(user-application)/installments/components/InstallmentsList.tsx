'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import SimplePagination from "../../components/SimplePagination";
import { useMemo } from "react";
import dayjs from "dayjs";

type InstallmentRow = {
    id: number;
    amount: string;
    dueDate: string;
    paidAt: string | null;
    account: { code: string };
};

function paymentStatus(row: InstallmentRow): string {
    if (row.paidAt) return "Paid";
    if (dayjs(row.dueDate).isBefore(dayjs())) return "Overdue";
    return "Not paid";
}

type Props = {
    installments: string;
    totalPages: number;
    currentPage: number;
    searchParams: Record<string, string>;
};

export default function InstallmentsList({
    installments, totalPages, currentPage, searchParams,
}: Props) {
    const { t } = useUserPreferences();
    const { formatMoney, formatDate } = useLocaleFormat();
    const rows = useMemo(() => JSON.parse(installments) as InstallmentRow[], [installments]);

    if (!rows.length) {
        return <p className="text-sm text-[var(--color-muted-foreground)]">No installments found.</p>;
    }

    return (
        <div className="space-y-3">
            {rows.map((row) => {
                const status = paymentStatus(row);
                return (
                    <Card key={row.id}>
                        <CardContent className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium">{row.account.code}</p>
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
                            <p className="font-semibold">{formatMoney(row.amount)}</p>
                        </CardContent>
                    </Card>
                );
            })}
            <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/installments"
                searchParams={searchParams}
            />
        </div>
    );
}
