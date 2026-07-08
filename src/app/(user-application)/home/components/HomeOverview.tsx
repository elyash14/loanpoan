'use client';

import { useMemo } from "react";
import HomeHero from "./HomeHero";
import HomeQuickActions from "./HomeQuickActions";
import HomeTabs from "./HomeTabs";
import type { HomeDashboardData } from "./types";

type Props = {
    fullName: string;
    dashboard: string;
};

export type { HomeDashboardData } from "./types";

export default function HomeOverview({ fullName, dashboard }: Props) {
    const data = useMemo(() => JSON.parse(dashboard) as HomeDashboardData, [dashboard]);

    return (
        <div className="space-y-4">
            <HomeHero fullName={fullName} totalBalance={data.totalBalance} />
            <HomeQuickActions />
            <HomeTabs data={data} />
        </div>
    );
}
