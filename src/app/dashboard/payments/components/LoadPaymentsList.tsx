
import { paginatedPaymentsList } from "@database/payment/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import PaymentsList from "./PaymentsList";

export type LoadPaymentsListProps = {
    searchParams: PageSearchParams;
}
export default async function LoadPaymentsList({ searchParams }: LoadPaymentsListProps) {
    const search = searchParams?.search || '';
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
    const sortBy = searchParams?.sortBy || 'dueDate';
    const sortDir = searchParams?.sortDir || '-';
    const loanId = Number(searchParams?.loanId);
    const status = searchParams?.status || 'All';

    const { data, total } = await paginatedPaymentsList(page, limit, status, loanId, search, sortBy, sortDir);

    return <PaymentsList
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
    />
}