'use client';

import AccountCard, { AccountCardData } from "./AccountCard";
import SimplePagination from "../../components/SimplePagination";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { Wallet } from "lucide-react";
import { useMemo } from "react";

type Props = {
    accounts: string;
    totalPages: number;
    currentPage: number;
    searchParams: Record<string, string>;
};

export default function AccountsList({ accounts, totalPages, currentPage, searchParams }: Props) {
    const { t } = useUserPreferences();
    const rows = useMemo(() => JSON.parse(accounts) as AccountCardData[], [accounts]);

    if (!rows.length) {
        return (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-card)]/50 px-6 py-12 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
                    <Wallet className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="font-medium">{t("accounts.emptyTitle")}</p>
                <p className="mt-1 max-w-[240px] text-sm text-[var(--color-muted-foreground)]">
                    {t("accounts.emptyDesc")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {rows.map((account) => (
                <AccountCard key={account.id} account={account} />
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
