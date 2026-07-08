'use client';

import { useState } from "react";
import SegmentedTabs from "../../components/SegmentedTabs";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import HomeGlobalTab from "./HomeGlobalTab";
import HomePersonalTab from "./HomePersonalTab";
import HomeStatusTab from "./HomeStatusTab";
import type { HomeDashboardData, HomeTabId } from "./types";

type Props = {
    data: HomeDashboardData;
};

export default function HomeTabs({ data }: Props) {
    const { t } = useUserPreferences();
    const [activeTab, setActiveTab] = useState<HomeTabId>("status");
    const hasNotice = data.notice.overdueCount > 0 || data.notice.upcomingCount > 0;

    const tabs = [
        { id: "status" as const, label: t("home.tabs.status"), badge: hasNotice },
        { id: "personal" as const, label: t("home.tabs.personal") },
        { id: "global" as const, label: t("home.tabs.global") },
    ];

    return (
        <div className="space-y-3">
            <SegmentedTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            {activeTab === "status" ? (
                <HomeStatusTab data={data} />
            ) : activeTab === "personal" ? (
                <HomePersonalTab data={data} />
            ) : (
                <HomeGlobalTab globalStats={data.globalStats} />
            )}
        </div>
    );
}
