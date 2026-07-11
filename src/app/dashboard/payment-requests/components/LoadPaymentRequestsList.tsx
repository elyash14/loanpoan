import { paginatedPaymentRequestsList } from "@database/payment/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import PaymentRequestsList from "./PaymentRequestsList";

export type LoadPaymentRequestsListProps = {
    searchParams: PageSearchParams;
};

export default async function LoadPaymentRequestsList({ searchParams }: LoadPaymentRequestsListProps) {
    const search = searchParams?.search || "";
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
    const sortBy = searchParams?.sortBy || "createdAt";
    const sortDir = searchParams?.sortDir || "-";
    const status = searchParams?.status || "All";

    const { data, total } = await paginatedPaymentRequestsList(page, limit, status, search, sortBy, sortDir);

    return (
        <PaymentRequestsList
            paymentRequests={JSON.stringify(data)}
            totalPages={Math.ceil(total / limit)}
            currentPage={page}
            pageSize={limit}
            sortBy={sortBy}
            sortDir={sortDir}
            search={search}
            status={status}
        />
    );
}
