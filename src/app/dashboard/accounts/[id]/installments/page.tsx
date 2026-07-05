import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import LoadInstallmentsList from "@dashboard/installments/components/LoadInstallmentsList";
import { IconIdBadge2 } from "@tabler/icons-react";
import { Suspense } from "react";
import { InstancePage } from "utils/types/pageTypes";

export default async function Installments({ searchParams, params }: InstancePage) {
    const resolvedSearchParams = await searchParams;
    const { id } = await params;

    return (
        <PagePaper>
            <h2><IconIdBadge2 />&nbsp;Installments</h2>
            <Suspense fallback={<ListPageSkeleton />}>
                <LoadInstallmentsList searchParams={resolvedSearchParams} accountId={Number(id)} />
            </Suspense>
        </PagePaper>
    );
}
