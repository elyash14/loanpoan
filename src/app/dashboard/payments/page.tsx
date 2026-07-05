
import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconCash } from "@tabler/icons-react";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadPaymentsList from "./components/LoadPaymentsList";

export default async function Payments({ searchParams }: ListPage) {
  const resolvedSearchParams = await searchParams;

  return (
    <PagePaper>
      <h2><IconCash />&nbsp;Payments</h2>
      <Suspense fallback={<ListPageSkeleton />}>
        <LoadPaymentsList searchParams={resolvedSearchParams} />
      </Suspense>
    </PagePaper>
  );
}
