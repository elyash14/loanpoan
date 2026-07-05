
import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconUsers } from "@tabler/icons-react";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadUserList from "./components/LoadUserList";

export default async function Users({ searchParams }: ListPage) {
  const resolvedSearchParams = await searchParams;

  return (
    <PagePaper>
      <h2><IconUsers />&nbsp;Users</h2>
      <Suspense fallback={<ListPageSkeleton />}>
        <LoadUserList searchParams={resolvedSearchParams} />
      </Suspense>
    </PagePaper>
  );
}
