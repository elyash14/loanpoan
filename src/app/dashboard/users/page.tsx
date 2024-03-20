
import { paginatedUsersList } from "@database/user/data";
import { Suspense } from "react";
import { ITEMS_PER_PAGE } from "utils/configs";
import { ListPage } from "utils/types/pageTypes";
import UsersList from "./components/UsersList";

export default async function Users({ searchParams }: ListPage) {

  const search = searchParams?.search || '';
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
  const sortBy = searchParams?.sortBy || 'createdAt';
  const sortDir = searchParams?.sortDir || '-';

  const { data, total } = await paginatedUsersList(page, limit, search, sortBy, sortDir);

  return (
    <main>
      <Suspense key={search + page} fallback={<>Loading ...</>}>
        <UsersList
          // convert data to a string object to avoid NextJS hydration error
          users={JSON.stringify(data) as any}
          totalPages={Math.ceil(total / limit)}
          currentPage={page}
          pageSize={limit}
          sortBy={sortBy}
          sortDir={sortDir}
          search={search}
        />
      </Suspense>

    </main>
  );
}
