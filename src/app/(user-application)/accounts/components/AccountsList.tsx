'use client';

import { Card, CardContent } from "../../components/ui/card";
import { formatMoney } from "utils/formatMoney";
import Link from "next/link";
import SimplePagination from "../../components/SimplePagination";
import { useMemo } from "react";
import dayjs from "dayjs";

type AccountRow = {
    id: number;
    code: string;
    name: string | null;
    balance: string;
    openedAt: string | null;
};

type Props = {
    accounts: string;
    totalPages: number;
    currentPage: number;
    searchParams: Record<string, string>;
};

export default function AccountsList({ accounts, totalPages, currentPage, searchParams }: Props) {
    const rows = useMemo(() => JSON.parse(accounts) as AccountRow[], [accounts]);

    if (!rows.length) {
        return <p className="text-sm text-[var(--color-muted-foreground)]">No accounts found.</p>;
    }

    return (
        <div className="space-y-3">
            {rows.map((account) => (
                <Link key={account.id} href={`/accounts/${account.id}`}>
                    <Card>
                        <CardContent className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium">{account.code}</p>
                                {account.name ? (
                                    <p className="text-sm text-[var(--color-muted-foreground)]">{account.name}</p>
                                ) : null}
                                {account.openedAt ? (
                                    <p className="text-xs text-[var(--color-muted-foreground)]">
                                        Opened {dayjs(account.openedAt).format("YYYY-MM-DD")}
                                    </p>
                                ) : null}
                            </div>
                            <p className="font-semibold">{formatMoney(account.balance)}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            <SimplePagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/accounts"
                searchParams={searchParams}
            />
        </div>
    );
}
