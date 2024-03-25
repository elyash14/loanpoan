
import { paginatedAccountList } from "@database/account/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { ListPage } from "utils/types/pageTypes";
import AccountList from "./AccountList";

export default async function LoadAccountList({ searchParams }: ListPage) {
    const search = searchParams?.search || '';
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
    const sortBy = searchParams?.sortBy || 'updatedAt';
    const sortDir = searchParams?.sortDir || '-';

    const { data, total } = await paginatedAccountList(page, limit, search, sortBy, sortDir);

    return <AccountList
        // convert data to a string object to avoid NextJS hydration error
        accounts={JSON.stringify(data) as any}
        totalPages={Math.ceil(total / limit)}
        currentPage={page}
        pageSize={limit}
        sortBy={sortBy}
        sortDir={sortDir}
        search={search}
    />
}