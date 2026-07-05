'use client';

import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { formatMoney } from "utils/formatMoney";
import Link from "next/link";
import { useMemo } from "react";
import dayjs from "dayjs";

type Account = {
    id: number;
    code: string;
    name: string | null;
    balance: string;
    openedAt: string | null;
    installmentFactor: number;
    loans: { id: number; amount: string; status: string }[];
    _count: { loans: number; installments: number };
};

export default function AccountDetail({ data }: { data: string }) {
    const account = useMemo(() => JSON.parse(data) as Account, [data]);
    const currentLoan = account.loans[0];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{account.code}</CardTitle>
                    {account.name ? (
                        <p className="text-sm text-[var(--color-muted-foreground)]">{account.name}</p>
                    ) : null}
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Balance</span>
                        <span className="font-semibold">{formatMoney(account.balance)}</span>
                    </div>
                    {account.openedAt ? (
                        <div className="flex justify-between">
                            <span>Opened</span>
                            <span>{dayjs(account.openedAt).format("YYYY-MM-DD")}</span>
                        </div>
                    ) : null}
                    <div className="flex justify-between">
                        <span>Loans</span>
                        <span>{account._count.loans}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Installments</span>
                        <span>{account._count.installments}</span>
                    </div>
                </CardContent>
            </Card>

            {currentLoan ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Current loan</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{formatMoney(currentLoan.amount)}</p>
                            <Badge variant="secondary">{currentLoan.status}</Badge>
                        </div>
                        <Link href={`/loans/${currentLoan.id}`} className="text-sm text-[var(--color-primary)]">
                            View
                        </Link>
                    </CardContent>
                </Card>
            ) : null}

            <Link
                href={`/installments?account=${account.id}`}
                className="block text-center text-sm text-[var(--color-primary)]"
            >
                View installments
            </Link>
        </div>
    );
}
