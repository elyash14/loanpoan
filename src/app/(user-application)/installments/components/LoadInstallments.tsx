import { paginatedUserInstallments } from "@database/user-panel/data";
import { getPanelUserId } from "utils/auth/userSession";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import InstallmentsList from "./InstallmentsList";
import { serializeClient } from "utils/serialize";
import StatusFilter from "../../components/StatusFilter";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

const STATUS_OPTIONS = [
    { label: "All", value: "" },
    { label: "Not paid", value: "Not Paid" },
    { label: "Paid", value: "Paid" },
    { label: "Overdue", value: "Overdue" },
];

type Props = { searchParams: Promise<PageSearchParams> };

export default async function LoadInstallments({ searchParams }: Props) {
    const params = await searchParams;
    const userId = await getPanelUserId();
    if (!userId) {
        return <UserPageAwaitingAuth />;
    }
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || ITEMS_PER_PAGE;
    const sortBy = params?.sortBy || "dueDate";
    const sortDir = (params?.sortDir || "-") as "+" | "-";
    const search = params?.search || "";
    const status = params?.status || "";
    const accountId = params?.account ? Number(params.account) : undefined;

    const { data, total } = await paginatedUserInstallments(
        userId, page, limit, status, search, sortBy, sortDir, accountId,
    );

    return (
        <>
            <StatusFilter options={STATUS_OPTIONS} value={status} basePath="/installments" />
            <InstallmentsList
                installments={serializeClient(data)}
                totalPages={Math.ceil(total / limit)}
                currentPage={page}
                searchParams={{
                    search, sortBy, sortDir,
                    ...(status ? { status } : {}),
                    ...(accountId ? { account: String(accountId) } : {}),
                }}
            />
        </>
    );
}
