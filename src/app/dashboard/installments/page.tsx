
import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconIdBadge2 } from "@tabler/icons-react";
import { Suspense } from "react";
import LoadInstallmentsList, { LoadInstallmentsListProps } from "./components/LoadInstallmentsList";

export default async function Installments({ searchParams }: LoadInstallmentsListProps) {
    return (
        <PagePaper>
            <h2><IconIdBadge2 />&nbsp;Installments</h2>
            <Suspense fallback={<ListPageSkeleton />}>
                <LoadInstallmentsList searchParams={searchParams} />
            </Suspense>
        </PagePaper>
    );
}
