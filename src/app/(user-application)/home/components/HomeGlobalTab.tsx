'use client';

import type { ReactNode } from "react";
import { cn } from "utils/cn";
import Money from "../../components/preferences/Money";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import { Card, CardContent } from "../../components/ui/card";
import type { HomeDashboardData } from "./types";

type Props = {
    globalStats: HomeDashboardData["globalStats"];
};

type StatItem = {
    labelKey: string;
    value: ReactNode;
    fullWidth?: boolean;
};

export default function HomeGlobalTab({ globalStats }: Props) {
    const { t } = useUserPreferences();
    const { formatNumber } = useLocaleFormat();

    const stats: StatItem[] = [
        {
            labelKey: "totalBankBalance",
            value: <Money value={globalStats.totalBankBalance} className="text-2xl font-bold tracking-tight" />,
            fullWidth: true,
        },
        {
            labelKey: "totalLoanAmount",
            value: <Money value={globalStats.totalLoanAmount} className="text-2xl font-bold tracking-tight" />,
            fullWidth: true,
        },
        {
            labelKey: "activeLoanAmount",
            value: <Money value={globalStats.activeLoanAmount} className="text-2xl font-bold tracking-tight" />,
            fullWidth: true,
        },
        {
            labelKey: "totalLoanCount",
            value: <span className="text-lg font-bold tabular-nums">{formatNumber(globalStats.totalLoanCount)}</span>,
        },
        {
            labelKey: "activeLoanCount",
            value: <span className="text-lg font-bold tabular-nums">{formatNumber(globalStats.activeLoanCount)}</span>,
        },
        {
            labelKey: "memberCount",
            value: <span className="text-lg font-bold tabular-nums">{formatNumber(globalStats.memberCount)}</span>,
        },
        {
            labelKey: "activeLoanMemberCount",
            value: <span className="text-lg font-bold tabular-nums">{formatNumber(globalStats.activeLoanMemberCount)}</span>,
        },
    ];

    return (
        <Card>
            <CardContent className="grid grid-cols-2 gap-2 py-4">
                {stats.map((stat) => (
                    <div
                        key={stat.labelKey}
                        className={cn(
                            "rounded-lg border border-border/70 bg-muted/20 px-3 py-3",
                            stat.fullWidth ? "col-span-2" : "col-span-1"
                        )}
                    >
                        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            {t(`home.global.${stat.labelKey}`)}
                        </p>
                        <div className="mt-1">{stat.value}</div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
