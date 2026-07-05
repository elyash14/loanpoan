import { getDashboardStats } from "@database/dashboard/data";
import DashboardOverview from "./DashboardOverview";

const LoadDashboardOverview = async () => {
    const stats = await getDashboardStats();

    return <DashboardOverview statsData={JSON.stringify(stats)} />;
};

export default LoadDashboardOverview;
