'use client';

import type { DashboardStats } from "@database/dashboard/data";
import DashboardCharts from "./DashboardCharts";
import DashboardStatCards from "./DashboardStatCards";

type Props = {
    statsData: string;
};

const DashboardOverview = ({ statsData }: Props) => {
    const stats: DashboardStats = JSON.parse(statsData);

    return (
        <>
            <DashboardStatCards stats={stats} />
            <DashboardCharts stats={stats} />
        </>
    );
};

export default DashboardOverview;
