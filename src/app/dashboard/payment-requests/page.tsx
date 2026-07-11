import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconCash } from "@tabler/icons-react";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadPaymentRequestsList from "./components/LoadPaymentRequestsList";

export default async function PaymentRequestsPage({ searchParams }: ListPage) {
    const resolvedSearchParams = await searchParams;

    return (
        <PagePaper>
            <h2>
                <IconCash />
                &nbsp;Payment Requests
            </h2>
            <Suspense fallback={<ListPageSkeleton />}>
                <LoadPaymentRequestsList searchParams={resolvedSearchParams} />
            </Suspense>
        </PagePaper>
    );
}
