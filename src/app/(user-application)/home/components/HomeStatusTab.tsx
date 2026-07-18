'use client';

import { LoanIcon } from "../../components/icons/LoanIcon";
import Money from "../../components/preferences/Money";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import PayDuesDrawer from "../../components/payments/PayDuesDrawer";
import type { HomeDashboardData } from "./types";
import { CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
    data: HomeDashboardData;
};

export default function HomeStatusTab({ data }: Props) {
    const { t } = useUserPreferences();
    const router = useRouter();
    const { formatMoney, formatNumber, formatPercent, formatDate } = useLocaleFormat();
    const hasActionableNotice = data.notice.overdueCount > 0 || data.notice.upcomingCount > 0;
    const hasPendingReview = data.notice.pendingReviewCount > 0;
    const [payDrawerOpen, setPayDrawerOpen] = useState(false);

    return (
        <div className="space-y-3">
            {hasActionableNotice ? (
                <Card className="group relative overflow-hidden border-destructive/20 shadow-sm">
                    <div className="absolute inset-y-0 start-0 w-1.5 bg-destructive/60" />
                    <CardContent className="space-y-2 py-4 ps-5">
                        {data.notice.overdueCount > 0 ? (
                            <p className="text-sm font-semibold text-destructive">
                                {t("home.noticeOverdue", {
                                    count: formatNumber(data.notice.overdueCount),
                                    amount: formatMoney(data.notice.overdueAmount),
                                })}
                            </p>
                        ) : null}
                        {data.notice.upcomingCount > 0 ? (
                            <p className="text-sm font-medium">
                                {t("home.noticeUpcoming", {
                                    count: formatNumber(data.notice.upcomingCount),
                                    amount: formatMoney(data.notice.upcomingAmount),
                                })}
                            </p>
                        ) : null}
                        {data.notice.nextDue ? (
                            <p className="text-xs text-muted-foreground">
                                {t("home.nextDue", {
                                    date: formatDate(data.notice.nextDue.dueDate),
                                    amount: formatMoney(data.notice.nextDue.amount),
                                })}
                            </p>
                        ) : null}
                        <p className="text-xs text-muted-foreground">{t("home.noticeHint")}</p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Button
                                type="button"
                                size="sm"
                                className="rounded-xl px-4 font-semibold"
                                onClick={() => setPayDrawerOpen(true)}
                            >
                                {t("home.payNow")}
                            </Button>
                            <Link
                                href="/installments?from=home"
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                {t("home.viewDues")}
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : hasPendingReview ? (
                <Card className="group relative overflow-hidden border-amber-500/25 bg-amber-500/5 shadow-sm">
                    <div className="absolute inset-y-0 start-0 w-1.5 bg-amber-500/70" />
                    <CardContent className="flex items-start gap-3 py-4 ps-5">
                        <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {t("home.noticePendingReview", {
                                    count: formatNumber(data.notice.pendingReviewCount),
                                })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t("home.noticePendingReviewHint")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="flex items-start gap-3 py-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        <p className="text-sm text-muted-foreground">{t("home.status.allClear")}</p>
                    </CardContent>
                </Card>
            )}
            <PayDuesDrawer
                open={payDrawerOpen}
                onClose={() => setPayDrawerOpen(false)}
                onSuccess={() => router.refresh()}
            />

            {data.activeLoan ? (
                <Card>
                    <CardContent className="space-y-2.5 py-4">
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <LoanIcon className="h-3.5 w-3.5 text-primary" />
                                {t("home.activeLoanProgress")} · {data.activeLoan.accountCode}
                            </span>
                            <span>{formatPercent(data.activeLoan.progressPercent)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                            <div
                                className="h-2 rounded-full bg-primary transition-[width] duration-300"
                                style={{ width: `${data.activeLoan.progressPercent}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">
                                {formatNumber(data.activeLoan.paidCount)}/{formatNumber(data.activeLoan.paymentCount)}
                            </span>
                            <span className="font-medium">
                                {t("home.remainingAmount")}: <Money value={data.activeLoan.remainingAmount} />
                            </span>
                        </div>
                        <Link
                            href={`/loans/${data.activeLoan.id}`}
                            className="inline-flex text-xs font-medium text-primary hover:underline"
                        >
                            {t("common.view")}
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="space-y-2 py-4 text-center">
                        <p className="text-sm text-muted-foreground">{t("home.status.noActiveLoan")}</p>
                        <Link
                            href="/loans"
                            className="inline-flex text-xs font-medium text-primary hover:underline"
                        >
                            {t("home.status.viewLoans")}
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
