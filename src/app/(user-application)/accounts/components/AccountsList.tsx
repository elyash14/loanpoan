'use client';

import AccountCard, { AccountCardData } from "./AccountCard";
import LoadMoreButton from "../../components/LoadMoreButton";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import { loadMoreUserAccounts } from "@database/user-panel/data";
import { Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
    accounts: string;
    total: number;
    hasMore: boolean;
    search: string;
    sortBy: string;
    sortDir: "+" | "-";
};

export default function AccountsList({
    accounts,
    total,
    hasMore: initialHasMore,
    search,
    sortBy,
    sortDir,
}: Props) {
    const { t } = useUserPreferences();
    const { formatNumber } = useLocaleFormat();
    const initialRows = useMemo(() => JSON.parse(accounts) as AccountCardData[], [accounts]);
    const [rows, setRows] = useState(initialRows);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setRows(initialRows);
        setPage(1);
        setHasMore(initialHasMore);
    }, [accounts, initialHasMore, initialRows]);

    const handleLoadMore = async () => {
        const nextPage = page + 1;
        setLoading(true);
        try {
            const result = await loadMoreUserAccounts({
                page: nextPage,
                search,
                sortBy,
                sortDir,
            });
            setRows((current) => [...current, ...result.data]);
            setPage(nextPage);
            setHasMore(result.hasMore);
        } finally {
            setLoading(false);
        }
    };

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

            {total > rows.length ? (
                <p className="text-center text-xs text-muted-foreground">
                    {t("common.showingCount", {
                        shown: formatNumber(rows.length),
                        total: formatNumber(total),
                    })}
                </p>
            ) : null}

            <LoadMoreButton hasMore={hasMore} loading={loading} onClick={handleLoadMore} />
        </div>
    );
}
