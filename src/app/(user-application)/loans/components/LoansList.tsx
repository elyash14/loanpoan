'use client';

import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
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
    const rows = useMemo(() => JSON.parse(loans) as LoanRow[], [loans]);

    if (!rows.length) {
        return <p className="text-sm text-[var(--color-muted-foreground)]">No loans found.</p>;
    }

    return (
        <div className="space-y-3">
            {rows.map((loan) => (
                <Link key={loan.id} href={`/loans/${loan.id}`}>
                    <Card>
                        <CardContent className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium">{loan.account.code}</p>
                                <p className="text-xs text-[var(--color-muted-foreground)]">
                                    {dayjs(loan.createdAt).format("YYYY-MM-DD")}
                                </p>
                                <Badge variant="secondary" className="mt-1">{loan.status}</Badge>
                            </div>
                            <p className="font-semibold">{formatMoney(loan.amount)}</p>
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
