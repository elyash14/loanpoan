import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconIdBadge2 } from "@tabler/icons-react";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadInstallmentsList from "./components/LoadInstallmentsList";

export default async function Installments({ searchParams }: ListPage) {
    const resolvedSearchParams = await searchParams;

    return (
        <PagePaper>
            <h2><IconIdBadge2 />&nbsp;Installments</h2>
            <Suspense fallback={<ListPageSkeleton />}>
                <LoadInstallmentsList searchParams={resolvedSearchParams} />
            </Suspense>
        </PagePaper>
    );
}
