import { paginatedUsersList } from "@database/user/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { ListPage } from "utils/types/pageTypes";
import UsersList from "./UsersList";


export default async function LoadUserList({ searchParams }: ListPage) {
    const search = searchParams?.search || '';
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
    const sortBy = searchParams?.sortBy || 'createdAt';
    const sortDir = searchParams?.sortDir || '-';

    const { data, total } = await paginatedUsersList(page, limit, search, sortBy, sortDir);

    return <UsersList
        // convert data to a string object to avoid NextJS hydration error
        users={JSON.stringify(data) as any}
        totalPages={Math.ceil(total / limit)}
        currentPage={page}
        pageSize={limit}
        sortBy={sortBy}
        sortDir={sortDir}
        search={search}
    />
}