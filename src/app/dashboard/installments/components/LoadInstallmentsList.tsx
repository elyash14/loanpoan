import { paginatedInstallmentsList } from "@database/installments/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { ListPage } from "utils/types/pageTypes";
import InstallmentsList from "./InstallmentsList";

export type LoadInstallmentsListProps = {
    searchParams: ListPage["searchParams"] & {
        loanId: string,
        status: string,
    },
    accountId?: number
}

export default async function LoadInstallmentsList({
    searchParams,
    accountId = undefined
}: LoadInstallmentsListProps) {
    const search = searchParams?.search || '';
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
    const sortBy = searchParams?.sortBy || 'dueDate';
    const sortDir = searchParams?.sortDir || '-';
    const loanId = Number(searchParams?.loanId);
    const status = searchParams?.status || 'All';

    const { data, total } = await paginatedInstallmentsList(
        page,
        limit,
        status,
        loanId,
        search,
        sortBy,
        sortDir,
        accountId
    );

    return <InstallmentsList
        // convert data to a string object to avoid NextJS hydration error
        payments={JSON.stringify(data) as any}
        totalPages={Math.ceil(total / limit)}
        currentPage={page}
        pageSize={limit}
        sortBy={sortBy}
        sortDir={sortDir}
        search={search}
        status={status}
        loanId={loanId}
        accountId={accountId}
    />
}