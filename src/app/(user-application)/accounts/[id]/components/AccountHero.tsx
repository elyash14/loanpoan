'use client';

import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../../components/preferences/useLocaleFormat";
import { LoanIcon } from "../../../components/icons/LoanIcon";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type { AccountDetailData } from "./types";

type Props = {
    account: AccountDetailData;
};

export default function AccountHero({ account }: Props) {
    const { t } = useUserPreferences();
    const { formatMoney, formatNumber, formatDigits, formatDate } = useLocaleFormat();
    const currentLoan = account.loans[0];
    const dateLabel = account.openedAt
        ? formatDate(account.openedAt)
        : null;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <CardTitle className="text-lg tracking-tight">{account.code}</CardTitle>
                        {account.name ? (
                            <p className="text-sm text-muted-foreground">{account.name}</p>
                        ) : null}
                    </div>
                    <div className="shrink-0 rounded-md bg-muted/60 px-2.5 py-1.5 text-end">
                        <p className="text-[11px] leading-4 text-muted-foreground inline-block">{t("accounts.kpiInstallmentFactor")}: &nbsp;</p>
                        <p className="text-sm font-semibold tabular-nums leading-5 inline-block">{formatDigits(account.installmentFactor)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-xs text-muted-foreground">{t("common.balance")}</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                        {formatMoney(account.balance)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                        {t("accounts.loans")}: {formatNumber(account._count.loans)}
                    </Badge>
                    <Badge variant="secondary">
                        {t("accounts.installments")}: {formatNumber(account._count.installments)}
                    </Badge>
                    {currentLoan ? (
                        <Badge className="inline-flex items-center gap-1">
                            <LoanIcon className="h-3.5 w-3.5" />
                            {t("common.onLoan")}
                        </Badge>
                    ) : null}
                </div>

                {account.kpis.unpaidInstallments > 0 ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                        <p className="text-sm font-semibold text-destructive">
                            {t("accounts.unpaidInstallmentsNotice", { count: formatNumber(account.kpis.unpaidInstallments) })}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t("accounts.unpaidInstallmentsHint")}
                        </p>
                    </div>
                ) : null}

                {dateLabel ? (
                    <p className="text-xs text-muted-foreground">
                        {t("common.opened", { date: dateLabel })}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
