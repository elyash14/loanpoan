import { getPanelUserId } from "utils/auth/userSession";
import { paginatedUserAccounts } from "@database/user-panel/data";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import AccountsList from "./AccountsList";
import { serializeClient } from "utils/serialize";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

type Props = { searchParams: Promise<PageSearchParams> };

export default async function LoadAccounts({ searchParams }: Props) {
    const params = await searchParams;
    const userId = await getPanelUserId();
    if (!userId) {
        return <UserPageAwaitingAuth />;
    }
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || ITEMS_PER_PAGE;
    const sortBy = params?.sortBy || "openedAt";
    const sortDir = (params?.sortDir || "-") as "+" | "-";
    const search = params?.search || "";

    const { data, total } = await paginatedUserAccounts(userId, page, limit, search, sortBy, sortDir);

    return (
        <AccountsList
            accounts={serializeClient(data)}
            totalPages={Math.ceil(total / limit)}
            currentPage={page}
            searchParams={{ search, sortBy, sortDir }}
        />
    );
}
