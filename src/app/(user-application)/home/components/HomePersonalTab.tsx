'use client';

import { Award, Hash, Trophy } from "lucide-react";
import { cn } from "utils/cn";
import Money from "../../components/preferences/Money";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import type { HomeDashboardData } from "./types";

type Props = {
    data: HomeDashboardData;
};

export default function HomePersonalTab({ data }: Props) {
    const { t } = useUserPreferences();
    const { formatNumber } = useLocaleFormat();

    const punctualityPositive = data.punctualityScore > 0;
    const punctualityNegative = data.punctualityScore < 0;
    const punctualityLabel = punctualityPositive
        ? `+${formatNumber(data.punctualityScore)}`
        : formatNumber(data.punctualityScore);

    return (
        <div className="space-y-3">
            {data.loanRanking ? (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Hash className="h-4 w-4 text-primary" />
                            {t("home.loanRanking")}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{t("home.loanRankingDesc")}</p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-br from-primary/10 to-transparent px-3.5 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary/80">
                                {t("home.rankingByCount")}
                            </p>
                            <p className="mt-1.5 text-2xl font-black tracking-tight text-foreground">
                                {t("home.rankingPosition", {
                                    position: formatNumber(data.loanRanking.byCount.position),
                                    total: formatNumber(data.loanRanking.byCount.totalUsers),
                                })}
                            </p>
                            <p className="mt-1 font-medium text-xs text-muted-foreground">
                                {t("home.rankingLoanCount", {
                                    count: formatNumber(data.loanRanking.byCount.loanCount),
                                })}
                            </p>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-bl from-primary/10 to-transparent px-3.5 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary/80">
                                {t("home.rankingByAmount")}
                            </p>
                            <p className="mt-1.5 text-2xl font-black tracking-tight text-foreground">
                                {t("home.rankingPosition", {
                                    position: formatNumber(data.loanRanking.byAmount.position),
                                    total: formatNumber(data.loanRanking.byAmount.totalUsers),
                                })}
                            </p>
                            <p className="mt-1 font-medium text-xs text-muted-foreground">
                                <Money value={data.loanRanking.byAmount.loanAmount} />
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Trophy className="h-4 w-4 text-primary" />
                        {t("home.achievements")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.queue ? (
                        <div className="rounded-md bg-muted/30 px-3 py-2">
                            <p className="text-sm font-semibold">
                                {t("home.queuePosition", {
                                    position: formatNumber(data.queue.position),
                                    total: formatNumber(data.queue.totalEligible),
                                })}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{t("home.queueEligibleNote")}</p>
                        </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2">
                        <div className="min-w-0">
                            <p className="text-sm font-medium">{t("home.punctualityScore")}</p>
                            <p className="text-xs text-muted-foreground">{t("home.punctualityHint")}</p>
                        </div>
                        <Badge
                            className={cn(
                                "shrink-0 px-2.5 py-1 text-sm font-bold tabular-nums",
                                punctualityPositive && "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
                                punctualityNegative && "border-rose-500/40 bg-rose-500/10 text-rose-600",
                                !punctualityPositive && !punctualityNegative && "border-border bg-muted/40 text-muted-foreground",
                            )}
                        >
                            <Award className="me-1 inline h-3.5 w-3.5" />
                            {punctualityLabel}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
