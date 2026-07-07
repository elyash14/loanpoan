import UserShell from "../components/shell/UserShell";
import LoadAccounts from "./components/LoadAccounts";
import { Suspense } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { PageSearchParams } from "utils/types/pageTypes";

export default async function AccountsPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    return (
        <UserShell titleKey="pages.accounts" descriptionKey="pages.accountsDesc">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadAccounts searchParams={searchParams} />
            </Suspense>
        </UserShell>
    );
}
