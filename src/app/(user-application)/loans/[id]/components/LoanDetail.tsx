'use client';

import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { formatMoney } from "utils/formatMoney";
import Link from "next/link";
import { useMemo } from "react";
import dayjs from "dayjs";

type Loan = {
    id: number;
    amount: string;
    status: string;
    duration: number;
    account: { id: number; code: string };
    _count: { payments: number };
    payments: { id: number; amount: string; dueDate: string }[];
};

export default function LoanDetail({ data }: { data: string }) {
    const loan = useMemo(() => JSON.parse(data) as Loan, [data]);
    const nextPayment = loan.payments[0];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{loan.account.code}</CardTitle>
                    <Badge variant="secondary">{loan.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Amount</span>
                        <span className="font-semibold">{formatMoney(loan.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Duration</span>
                        <span>{loan.duration} months</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Payments made</span>
                        <span>{loan._count.payments}</span>
                    </div>
                </CardContent>
            </Card>

            {nextPayment ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Next payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <p className="font-medium">{formatMoney(nextPayment.amount)}</p>
                        <p className="text-[var(--color-muted-foreground)]">
                            Due {dayjs(nextPayment.dueDate).format("YYYY-MM-DD")}
                        </p>
                    </CardContent>
                </Card>
            ) : null}

            <Link
                href={`/payments?loan=${loan.id}`}
                className="block text-center text-sm text-[var(--color-primary)]"
            >
                View all payments
            </Link>
        </div>
    );
}
