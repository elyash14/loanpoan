
import { paginatedLoanList } from "@database/loan/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { ListPage } from "utils/types/pageTypes";
import LoanList from "./LoanList";

export default async function LoadLoanList({ searchParams }: ListPage) {
    const search = searchParams?.search || '';
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
    const sortBy = searchParams?.sortBy || 'startedAt';
    const sortDir = searchParams?.sortDir || '-';

    const { data, total } = await paginatedLoanList(page, limit, search, sortBy, sortDir);

    return <LoanList
        // convert data to a string object to avoid NextJS hydration error
        loans={JSON.stringify(data) as any}
        totalPages={Math.ceil(total / limit)}
        currentPage={page}
        pageSize={limit}
        sortBy={sortBy}
        sortDir={sortDir}
        search={search}
    />
}