'use client';

import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { LoanIcon } from "../../../components/icons/LoanIcon";
import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";
import { formatMoney } from "utils/formatMoney";
import dayjs from "dayjs";
import "dayjs/locale/fa";
import type { LoanDetailData } from "./types";

type Props = {
    loan: LoanDetailData;
};

export default function LoanHero({ loan }: Props) {
    const { t, locale } = useUserPreferences();
    const statusLabel = loan.status === "IN_PROGRESS"
        ? t("status.inProgress")
        : loan.status === "FINISHED"
            ? t("status.finished")
            : t("status.overdue");

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <LoanIcon className="h-4 w-4 text-primary" />
                            <CardTitle className="truncate text-lg">{loan.account.code}</CardTitle>
                        </div>
                        {loan.account.name ? (
                            <p className="mt-1 truncate text-sm text-muted-foreground">{loan.account.name}</p>
                        ) : null}
                        {loan.description ? (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{loan.description}</p>
                        ) : null}
                    </div>
                    <Badge variant="secondary" className="shrink-0">{statusLabel}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <p className="text-xs text-muted-foreground">{t("loans.amount")}</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                        {formatMoney(loan.amount)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                        {t("loans.kpiRemainingAmount")}: {formatMoney(loan.stats.remainingAmount)}
                    </p>
                </div>
                <div className="rounded-md bg-muted/30 px-3 py-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("loans.progress")}</span>
                        <span>{loan.stats.progressPercent}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                        <div
                            className="h-2 rounded-full bg-primary transition-[width] duration-300"
                            style={{ width: `${loan.stats.progressPercent}%` }}
                        />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    {t("loans.createdAt")}: {dayjs(loan.createdAt).locale(locale).format("YYYY-MM-DD")}
                </p>
            </CardContent>
        </Card>
    );
}
