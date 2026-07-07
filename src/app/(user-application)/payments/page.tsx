import UserShell from "../components/shell/UserShell";
import LoadPayments from "./components/LoadPayments";
import { Suspense } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { PageSearchParams } from "utils/types/pageTypes";

export default async function PaymentsPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    return (
        <UserShell titleKey="pages.payments">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadPayments searchParams={searchParams} />
            </Suspense>
        </UserShell>
    );
}
