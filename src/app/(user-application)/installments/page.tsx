import UserShell from "../components/shell/UserShell";
import LoadInstallments from "./components/LoadInstallments";
import { Suspense } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { PageSearchParams } from "utils/types/pageTypes";

export default async function InstallmentsPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    return (
        <UserShell titleKey="pages.installments">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadInstallments searchParams={searchParams} />
            </Suspense>
        </UserShell>
    );
}
