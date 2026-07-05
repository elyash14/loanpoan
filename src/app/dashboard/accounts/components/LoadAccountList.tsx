import { paginatedAccountList } from "@database/account/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import AccountList from "./AccountList";

export default async function LoadAccountList({ searchParams }: { searchParams: PageSearchParams }) {
    const search = searchParams?.search || "";
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
    const sortBy = searchParams?.sortBy || "openedAt";
    const sortDir = searchParams?.sortDir || "-";
    const userId = searchParams?.user ? Number(searchParams.user) : undefined;

    const { data, total } = await paginatedAccountList(
        page,
        limit,
        search,
        sortBy,
        sortDir,
        userId,
    );

    return (
        <AccountList
            // convert data to a string object to avoid NextJS hydration error
            accounts={JSON.stringify(data) as any}
            totalPages={Math.ceil(total / limit)}
            currentPage={page}
            pageSize={limit}
            sortBy={sortBy}
            sortDir={sortDir}
            search={search}
        />
    );
}
