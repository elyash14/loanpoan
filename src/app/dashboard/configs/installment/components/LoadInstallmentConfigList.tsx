import { paginatedInstallmentAmountList } from "@database/installment-amount/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { ListPage } from "utils/types/pageTypes";
import InstallmentAmountList from "./InstallmentAmountList";


export default async function LoadInstallmentConfigList({ searchParams }: ListPage) {
    const search = searchParams?.search || '';
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
    const sortBy = searchParams?.sortBy || 'createdAt';
    const sortDir = searchParams?.sortDir || '-';

    const { data, total } = await paginatedInstallmentAmountList(page, limit, search, sortBy, sortDir);

    return <InstallmentAmountList
        // convert data to a string object to avoid NextJS hydration error
        installments={JSON.stringify(data) as any}
        totalPages={Math.ceil(total / limit)}
        currentPage={page}
        pageSize={limit}
        sortBy={sortBy}
        sortDir={sortDir}
        search={search}
    />
}