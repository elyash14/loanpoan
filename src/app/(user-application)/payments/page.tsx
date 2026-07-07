import UserShell from "../components/shell/UserShell";
import { getPaymentsBackHref } from "../utils/paymentsNavigation";
import LoadPayments from "./components/LoadPayments";
import { Suspense } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { PageSearchParams } from "utils/types/pageTypes";

export default async function PaymentsPage({
    searchParams,
}: {
    searchParams: Promise<PageSearchParams>;
}) {
    const params = await searchParams;
    const from = params?.from;
    const loanId = params?.loan;
    const fromLoan = params?.fromLoan;

    return (
        <UserShell
            titleKey="pages.payments"
            descriptionKey="pages.paymentsDesc"
            showBack
            backHref={getPaymentsBackHref(from, loanId, fromLoan)}
        >
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadPayments searchParams={searchParams} />
            </Suspense>
        </UserShell>
    );
}
