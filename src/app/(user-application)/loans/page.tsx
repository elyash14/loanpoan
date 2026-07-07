import UserShell from "../components/shell/UserShell";
import LoadLoans from "./components/LoadLoans";
import { Suspense } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { PageSearchParams } from "utils/types/pageTypes";

export default async function LoansPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    return (
        <UserShell titleKey="pages.loans">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadLoans searchParams={searchParams} />
            </Suspense>
        </UserShell>
    );
}
