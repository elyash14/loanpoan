'use client';

import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import { paymentsQueryParams } from "../../utils/paymentsNavigation";
import { cn } from "utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type LoanOption = {
    id: number;
    account: { code: string };
};

type Props = {
    status: string;
    loanId?: number;
    from?: string;
    fromLoan?: number;
    loans: string;
};

export default function PaymentsFilters({ status, loanId, from, fromLoan, loans }: Props) {
    const router = useRouter();
    const { t } = useUserPreferences();
    const { formatDigits } = useLocaleFormat();
    const loanOptions = useMemo(() => JSON.parse(loans) as LoanOption[], [loans]);

    const statusOptions = [
        { label: t("status.all"), value: "" },
        { label: t("status.unpaid"), value: "Not Paid" },
        { label: t("status.paid"), value: "Paid" },
        { label: t("status.overdue"), value: "Overdue" },
    ];

    const onLoanChange = (value: string) => {
        router.push(
            paymentsQueryParams({
                from,
                fromLoan: from === "loan" ? fromLoan : undefined,
                loan: value || undefined,
                status: status || undefined,
            }),
        );
    };

    return (
        <div className="mb-4 space-y-3">
            <div>
                <label
                    htmlFor="payments-loan-filter"
                    className="mb-2 block text-xs font-medium text-muted-foreground"
                >
                    {t("payments.filterLoan")}
                </label>
                <select
                    id="payments-loan-filter"
                    value={loanId ?? ""}
                    onChange={(event) => onLoanChange(event.target.value)}
                    className={cn(
                        "h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]",
                        "bg-[var(--color-card)] px-3 text-sm text-[var(--color-foreground)]",
                        "outline-none ring-[var(--color-ring)] focus-visible:ring-2",
                    )}
                >
                    <option value="">{t("payments.allLoans")}</option>
                    {loanOptions.map((loan) => (
                        <option key={loan.id} value={loan.id}>
                            {t("payments.loanOption", {
                                code: loan.account.code,
                                id: formatDigits(loan.id),
                            })}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">{t("payments.filterStatus")}</p>
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((opt) => (
                        <Link
                            key={opt.value || "all"}
                            href={paymentsQueryParams({
                                from,
                                fromLoan: from === "loan" ? fromLoan : undefined,
                                loan: loanId,
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
