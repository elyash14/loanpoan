import UserShell from "../components/shell/UserShell";
import { getInstallmentsBackHref } from "../utils/installmentsNavigation";
import LoadInstallments from "./components/LoadInstallments";
import { Suspense } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { PageSearchParams } from "utils/types/pageTypes";

export default async function InstallmentsPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    const params = await searchParams;
    const from = params?.from;
    const accountId = params?.account;
    const fromAccount = params?.fromAccount;

    return (
        <UserShell
            titleKey="pages.installments"
            descriptionKey="pages.installmentsDesc"
            showBack
            backHref={getInstallmentsBackHref(from, accountId, fromAccount)}
        >
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadInstallments searchParams={searchParams} />
            </Suspense>
        </UserShell>
    );
}
