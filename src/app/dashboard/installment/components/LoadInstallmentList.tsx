import { paginatedInstallmentList } from "@database/installment/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { ListPage } from "utils/types/pageTypes";
import InstallmentList from "./InstallmentList";

export default async function LoadInstallmentList({ searchParams }: ListPage) {
  const search = searchParams?.search || "";
  const page = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
  const sortBy = searchParams?.sortBy || "createdAt";
  const sortDir = searchParams?.sortDir || "-";

  const { data, total } = await paginatedInstallmentList(
    page,
    limit,
    search,
    sortBy,
    sortDir,
  );

  return (
    <InstallmentList
      // convert data to a string object to avoid NextJS hydration error
      installment={JSON.stringify(data) as any}
      totalPages={Math.ceil(total / limit)}
      currentPage={page}
      pageSize={limit}
      sortBy={sortBy}
      sortDir={sortDir}
      search={search}
    />
  );
}
