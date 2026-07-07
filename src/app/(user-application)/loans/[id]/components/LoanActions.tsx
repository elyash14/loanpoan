'use client';

import { Card } from "../../../components/ui/card";
import { WalletCards, Landmark } from "lucide-react";
import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";
import Link from "next/link";
import type { LoanDetailData } from "./types";

type Props = {
    loan: LoanDetailData;
};

export default function LoanActions({ loan }: Props) {
    const { t } = useUserPreferences();
    return (
        <Card className="p-2">
            <div className="grid grid-cols-2 gap-2">
                <Link
                    href={`/payments?loan=${loan.id}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                    <WalletCards className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t("loans.viewPayments")}</span>
                </Link>
                <Link
                    href={`/accounts/${loan.account.id}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                    <Landmark className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t("pages.account")}</span>
                </Link>
            </div>
        </Card>
    );
}
