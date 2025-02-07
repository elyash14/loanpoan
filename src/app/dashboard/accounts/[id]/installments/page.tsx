import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import LoadInstallmentsList, { LoadInstallmentsListProps } from "@dashboard/installments/components/LoadInstallmentsList";
import { IconIdBadge2 } from "@tabler/icons-react";
import { Suspense } from "react";

export default async function Installments({ searchParams, params }: LoadInstallmentsListProps) {
    return (
        <PagePaper>
            <h2><IconIdBadge2 />&nbsp;Installments</h2>
            <Suspense fallback={<ListPageSkeleton />}>
                <LoadInstallmentsList searchParams={searchParams} accountId={Number(params.id)} />
            </Suspense>
        </PagePaper>
    );
}
