import { paginatedUserLoans } from "@database/user-panel/data";
import { getPanelUserId } from "utils/auth/userSession";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import LoansList from "./LoansList";
import { serializeClient } from "utils/serialize";
import StatusFilter from "../../components/StatusFilter";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

const STATUS_OPTIONS = [
    { label: "All", value: "" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Finished", value: "FINISHED" },
    { label: "Overdue", value: "Overdue" },
];

type Props = { searchParams: Promise<PageSearchParams> };

export default async function LoadLoans({ searchParams }: Props) {
    const params = await searchParams;
    const userId = await getPanelUserId();
    if (!userId) {
        return <UserPageAwaitingAuth />;
    }
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || ITEMS_PER_PAGE;
    const sortBy = params?.sortBy || "createdAt";
    const sortDir = (params?.sortDir || "-") as "+" | "-";
    const search = params?.search || "";
    const status = params?.status || "";

    const { data, total } = await paginatedUserLoans(
        userId, page, limit, search, sortBy, sortDir, status || undefined,
    );

    return (
        <>
            <StatusFilter options={STATUS_OPTIONS} value={status} basePath="/loans" />
            <LoansList
                loans={serializeClient(data)}
                totalPages={Math.ceil(total / limit)}
                currentPage={page}
                searchParams={{ search, sortBy, sortDir, ...(status ? { status } : {}) }}
            />
        </>
    );
}
