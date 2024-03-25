
import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconIdBadge2 } from "@tabler/icons-react";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadAccountList from "./components/LoadAccountList";

export default async function Accounts({ searchParams }: ListPage) {
  return (
    <PagePaper>
      <h2><IconIdBadge2 />&nbsp;Accounts</h2>
      <Suspense fallback={<ListPageSkeleton />}>
        <LoadAccountList searchParams={searchParams} />
      </Suspense>
    </PagePaper>
  );
}
