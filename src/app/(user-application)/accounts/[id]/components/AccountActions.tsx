'use client';

import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";
import { CalendarClock } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { LoanIcon } from "../../../components/icons/LoanIcon";
import Link from "next/link";
import type { AccountDetailData } from "./types";

type Props = {
    account: AccountDetailData;
};

export default function AccountActions({ account }: Props) {
    const { t } = useUserPreferences();
    const currentLoan = account.loans[0];

    return (
        <Card className="p-2">
            <div className="grid grid-cols-2 gap-2">
                <Link
                    href={`/installments?account=${account.id}&from=account&fromAccount=${account.id}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                    <CalendarClock className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t("accounts.viewInstallments")}</span>
                </Link>
                <Link
                    href={currentLoan ? `/loans/${currentLoan.id}` : "/loans"}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                    <LoanIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                        {currentLoan ? t("accounts.viewCurrentLoan") : t("pages.loans")}
                    </span>
                </Link>
            </div>
        </Card>
    );
}
