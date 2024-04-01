
import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconCash } from "@tabler/icons-react";
import { Suspense } from "react";
import LoadPaymentsList, { LoadPaymentsListProps } from "./components/LoadPaymentsList";

export default async function Payments({ searchParams }: LoadPaymentsListProps) {
  return (
    <PagePaper>
      <h2><IconCash />&nbsp;Payments</h2>
      <Suspense fallback={<ListPageSkeleton />}>
        <LoadPaymentsList searchParams={searchParams} />
      </Suspense>
    </PagePaper>
  );
}
