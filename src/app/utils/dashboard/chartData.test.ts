import { describe, expect, it } from "vitest";
import type { DashboardStats } from "@database/dashboard/data";
import { buildDashboardChartData } from "./chartData";

const sampleStats: DashboardStats = {
    totals: {
        loans: "1000",
        payments: "500",
        installments: "200",
    },
    overdue: {
        loans: "200",
        payments: "100",
        installments: "50",
    },
    collection: {
        paymentsPaid: "400",
        paymentsTotal: "500",
        installmentsPaid: "150",
        installmentsTotal: "200",
    },
};

describe("buildDashboardChartData", () => {
    it("maps totals and overdue into bar chart rows", () => {
        const { barData } = buildDashboardChartData(sampleStats);

        expect(barData).toHaveLength(3);
        expect(barData[0]).toEqual({
            category: "Loans",
            Total: 1000,
            Overdue: 200,
        });
        expect(barData[1]).toEqual({
            category: "Payments",
            Total: 500,
            Overdue: 100,
        });
        expect(barData[2]).toEqual({
            category: "Installments",
            Total: 200,
            Overdue: 50,
        });
    });

    it("filters zero slices from donut data", () => {
        const stats: DashboardStats = {
            ...sampleStats,
            overdue: {
                loans: "0",
                payments: "100",
                installments: "0",
            },
        };

        const { donutData } = buildDashboardChartData(stats);

        expect(donutData).toHaveLength(1);
        expect(donutData[0].name).toBe("Overdue payments");
        expect(donutData[0].value).toBe(100);
    });

    it("computes overdue percentages and total overdue", () => {
        const { overduePercentData, totalOverdue } =
            buildDashboardChartData(sampleStats);

        expect(overduePercentData[0].value).toBe(20);
        expect(overduePercentData[1].value).toBe(20);
        expect(overduePercentData[2].value).toBe(25);
        expect(totalOverdue).toBe(350);
    });

    it("returns zero percentages when totals are zero", () => {
        const stats: DashboardStats = {
            totals: { loans: "0", payments: "0", installments: "0" },
            overdue: { loans: "0", payments: "0", installments: "0" },
            collection: {
                paymentsPaid: "0",
                paymentsTotal: "0",
                installmentsPaid: "0",
                installmentsTotal: "0",
            },
        };

        const { overduePercentData, totalOverdue } = buildDashboardChartData(stats);

        expect(overduePercentData.every((row) => row.value === 0)).toBe(true);
        expect(totalOverdue).toBe(0);
    });
});
