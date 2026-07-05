import PagePaper from "@dashboard/components/paper/PagePaper";
import LoadDashboardOverview from "@dashboard/components/overview/LoadDashboardOverview";
import DashboardSkeleton from "@dashboard/components/overview/DashboardSkeleton";
import { IconDashboard } from "@tabler/icons-react";
import { Suspense } from "react";

export default function DashboardPage() {
    return (
        <PagePaper>
            <h2>
                <IconDashboard />
                &nbsp;Dashboard
            </h2>
            <Suspense fallback={<DashboardSkeleton />}>
                <LoadDashboardOverview />
            </Suspense>
        </PagePaper>
    );
}
