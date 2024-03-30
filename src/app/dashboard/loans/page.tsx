
import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconMoneybag } from "@tabler/icons-react";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadLoanList from "./components/LoadLoanList";

export default async function Loans({ searchParams }: ListPage) {
  return (
    <PagePaper>
      <h2><IconMoneybag />&nbsp;Loans</h2>
      <Suspense fallback={<ListPageSkeleton />}>
        <LoadLoanList searchParams={searchParams} />
      </Suspense>
    </PagePaper>
  );
}
