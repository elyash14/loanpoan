'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { LoanIcon } from "../../components/icons/LoanIcon";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { formatMoney } from "utils/formatMoney";
import Link from "next/link";
import SimplePagination from "../../components/SimplePagination";
import { useMemo } from "react";
import dayjs from "dayjs";

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
    const rows = useMemo(() => JSON.parse(loans) as LoanRow[], [loans]);

    if (!rows.length) {
        return <p className="text-sm text-[var(--color-muted-foreground)]">{t("loans.empty")}</p>;
    }

    return (
        <div className="space-y-3">
            {rows.map((loan) => (
                <Link key={loan.id} href={`/loans/${loan.id}`}>
                    <Card>
                        <CardContent className="flex items-center justify-between gap-3 py-4">
                            <div className="flex min-w-0 items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                                    <LoanIcon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="font-medium">{loan.account.code}</p>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">
                                        {dayjs(loan.createdAt).format("YYYY-MM-DD")}
                                    </p>
                                    <Badge variant="secondary" className="mt-1">{loan.status}</Badge>
                                </div>
                            </div>
                            <p className="shrink-0 font-semibold tabular-nums">{formatMoney(loan.amount)}</p>
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
