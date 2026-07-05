import type { DashboardStats } from "@database/dashboard/data";

export type DashboardBarChartRow = {
    category: string;
    Total: number;
    Overdue: number;
};

export type DashboardDonutSlice = {
    name: string;
    value: number;
    color: string;
};

export type DashboardOverduePercentRow = {
    name: string;
    value: number;
    color: string;
};

function toNumber(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function overduePercent(overdue: string, total: string): number {
    const totalNum = toNumber(total);
    if (totalNum <= 0) {
        return 0;
    }
    return Math.round((toNumber(overdue) / totalNum) * 100);
}

export function buildDashboardChartData(stats: DashboardStats) {
    const barData: DashboardBarChartRow[] = [
        {
            category: "Loans",
            Total: toNumber(stats.totals.loans),
            Overdue: toNumber(stats.overdue.loans),
        },
        {
            category: "Payments",
            Total: toNumber(stats.totals.payments),
            Overdue: toNumber(stats.overdue.payments),
        },
        {
            category: "Installments",
            Total: toNumber(stats.totals.installments),
            Overdue: toNumber(stats.overdue.installments),
        },
    ];

    const donutData: DashboardDonutSlice[] = [
        {
            name: "Overdue loans",
            value: toNumber(stats.overdue.loans),
            color: "red.6",
        },
        {
            name: "Overdue payments",
            value: toNumber(stats.overdue.payments),
            color: "orange.6",
        },
        {
            name: "Overdue installments",
            value: toNumber(stats.overdue.installments),
            color: "yellow.6",
        },
    ].filter((slice) => slice.value > 0);

    const overduePercentData: DashboardOverduePercentRow[] = [
        {
            name: "Loans",
            value: overduePercent(stats.overdue.loans, stats.totals.loans),
            color: "red.6",
        },
        {
            name: "Payments",
            value: overduePercent(stats.overdue.payments, stats.totals.payments),
            color: "orange.6",
        },
        {
            name: "Installments",
            value: overduePercent(
                stats.overdue.installments,
                stats.totals.installments,
            ),
            color: "yellow.6",
        },
    ];

    const totalOverdue =
        toNumber(stats.overdue.loans) +
        toNumber(stats.overdue.payments) +
        toNumber(stats.overdue.installments);

    return {
        barData,
        donutData,
        overduePercentData,
        totalOverdue,
    };
}
