'use client';

import type { DashboardStats } from "@database/dashboard/data";
import { BarChart, BarsList, DonutChart } from "@mantine/charts";
import { Grid, Paper, Text, Title } from "@mantine/core";
import { useAtomValue } from "jotai";
import { buildDashboardChartData } from "utils/dashboard/chartData";
import { globalConfigAtom } from "utils/stores/configs";

type Props = {
    stats: DashboardStats;
};

const DashboardCharts = ({ stats }: Props) => {
    const { currency } = useAtomValue(globalConfigAtom);
    const { barData, donutData, overduePercentData, totalOverdue } =
        buildDashboardChartData(stats);

    const formatCurrency = (value: number) =>
        `${currency?.symbol ?? ""} ${value.toLocaleString()}`;

    return (
        <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper withBorder p="md">
                    <Title order={4} mb="md">
                        Totals vs Overdue
                    </Title>
                    <BarChart
                        h={300}
                        data={barData}
                        dataKey="category"
                        series={[
                            { name: "Total", color: "blue.6" },
                            { name: "Overdue", color: "red.6" },
                        ]}
                        withLegend
                        valueFormatter={formatCurrency}
                        tickLine="y"
                        gridAxis="y"
                    />
                </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p="md">
                    <Title order={4} mb="md">
                        Overdue Exposure
                    </Title>
                    {donutData.length > 0 ? (
                        <DonutChart
                            h={300}
                            data={donutData}
                            withTooltip
                            withLabels
                            chartLabel={formatCurrency(totalOverdue)}
                            valueFormatter={formatCurrency}
                            size={200}
                            thickness={24}
                        />
                    ) : (
                        <Text c="dimmed" ta="center" py="xl">
                            No overdue amounts
                        </Text>
                    )}
                </Paper>
            </Grid.Col>
            <Grid.Col span={12}>
                <Paper withBorder p="md">
                    <Title order={4} mb="md">
                        Overdue Share by Category
                    </Title>
                    <BarsList
                        data={overduePercentData}
                        valueFormatter={(value) => `${value}%`}
                        barsLabel="Category"
                        valueLabel="Overdue %"
                    />
                </Paper>
            </Grid.Col>
        </Grid>
    );
};

export default DashboardCharts;
