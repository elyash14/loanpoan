import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconWallet } from "@tabler/icons-react";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadInstallmentList from "./components/LoadInstallmentList";

export default async function Installment({ searchParams }: ListPage) {
  return (
    <PagePaper>
      <h2>
        <IconWallet />
        &nbsp;Installment
      </h2>
      <Suspense fallback={<ListPageSkeleton />}>
        <LoadInstallmentList searchParams={searchParams} />
      </Suspense>
    </PagePaper>
  );
}
