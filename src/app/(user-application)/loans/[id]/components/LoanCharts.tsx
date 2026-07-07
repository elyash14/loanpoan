'use client';

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../../components/preferences/useLocaleFormat";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type { LoanDetailData } from "./types";

type Props = {
    loan: LoanDetailData;
    onSelectFilter?: (filter: "paid" | "unpaid" | "overdue") => void;
};

export default function LoanCharts({ loan, onSelectFilter }: Props) {
    const { t } = useUserPreferences();
    const { formatNumber, formatPercent } = useLocaleFormat();
    const donutData = [
        { key: "paid", label: t("status.paid"), value: loan.charts.statusBreakdown.paid, color: "var(--color-accent)" },
        { key: "unpaid", label: t("status.unpaid"), value: loan.charts.statusBreakdown.unpaid, color: "var(--color-muted-foreground)" },
        { key: "overdue", label: t("status.overdue"), value: loan.charts.statusBreakdown.overdue, color: "var(--color-destructive)" },
    ];

    return (
        <div className="grid gap-3">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t("loans.chartStatus")}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-[220px_1fr] md:items-center">
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--color-card)",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "10px",
                                    }}
                                />
                                <Pie
                                    data={donutData}
                                    dataKey="value"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={42}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    cornerRadius={3}
                                    onClick={(entry) => {
                                        if (entry && typeof entry === "object" && "key" in entry) {
                                            onSelectFilter?.(entry.key as "paid" | "unpaid" | "overdue");
                                        }
                                    }}
                                >
                                    {donutData.map((entry) => (
                                        <Cell key={entry.key} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                        <div className="rounded-md bg-muted/30 px-3 py-2">
                            <p className="text-xs text-muted-foreground">{t("loans.kpiPaymentPercent")}</p>
                            <p className="text-2xl font-bold tabular-nums">{formatPercent(loan.stats.progressPercent)}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatNumber(loan.stats.paidCount)}/{formatNumber(loan.paymentCount)} {t("loans.kpiPaidCount").toLowerCase()}
                            </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                            {donutData.map((entry) => (
                                <button
                                    key={entry.key}
                                    type="button"
                                    onClick={() => onSelectFilter?.(entry.key as "paid" | "unpaid" | "overdue")}
                                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                >
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    {entry.label}: {formatNumber(entry.value)}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
