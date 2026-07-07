'use client';

import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import { installmentsQueryParams } from "../../utils/installmentsNavigation";
import { cn } from "utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type AccountOption = {
    id: number;
    code: string;
    name: string | null;
    installmentFactor: number;
};

type Props = {
    status: string;
    accountId?: number;
    from?: string;
    fromAccount?: number;
    accounts: string;
};

export default function InstallmentsFilters({ status, accountId, from, fromAccount, accounts }: Props) {
    const router = useRouter();
    const { t } = useUserPreferences();
    const { formatDigits } = useLocaleFormat();
    const accountOptions = useMemo(() => JSON.parse(accounts) as AccountOption[], [accounts]);

    const statusOptions = [
        { label: t("status.all"), value: "" },
        { label: t("status.unpaid"), value: "Not Paid" },
        { label: t("status.paid"), value: "Paid" },
        { label: t("status.overdue"), value: "Overdue" },
    ];

    const onAccountChange = (value: string) => {
        router.push(
            installmentsQueryParams({
                from,
                fromAccount: from === "account" ? fromAccount : undefined,
                account: value || undefined,
                status: status || undefined,
            }),
        );
    };

    return (
        <div className="mb-4 space-y-3">
            <div>
                <label
                    htmlFor="installments-account-filter"
                    className="mb-2 block text-xs font-medium text-muted-foreground"
                >
                    {t("installments.filterAccount")}
                </label>
                <select
                    id="installments-account-filter"
                    value={accountId ?? ""}
                    onChange={(event) => onAccountChange(event.target.value)}
                    className={cn(
                        "h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]",
                        "bg-[var(--color-card)] px-3 text-sm text-[var(--color-foreground)]",
                        "outline-none ring-[var(--color-ring)] focus-visible:ring-2",
                    )}
                >
                    <option value="">{t("installments.allAccounts")}</option>
                    {accountOptions.map((account) => (
                        <option key={account.id} value={account.id}>
                            {t("installments.accountOption", {
                                code: account.code,
                                factor: formatDigits(account.installmentFactor),
                            })}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">{t("installments.filterStatus")}</p>
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((opt) => (
                        <Link
                            key={opt.value || "all"}
                            href={installmentsQueryParams({
                                from,
                                fromAccount: from === "account" ? fromAccount : undefined,
                                account: accountId,
                                status: opt.value || undefined,
                            })}
                            className={cn(
                                "rounded-full border px-3 py-1 text-xs transition-colors",
                                status === opt.value
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                                    : "border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
                            )}
                        >
                            {opt.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
