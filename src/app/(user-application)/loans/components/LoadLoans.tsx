import { paginatedUserLoans } from "@database/user-panel/data";
import { getPanelUserId } from "utils/auth/userSession";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import LoansList from "./LoansList";
import { serializeClient } from "utils/serialize";
import TranslatedStatusFilter from "../../components/TranslatedStatusFilter";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

type Props = { searchParams: Promise<PageSearchParams> };

export default async function LoadLoans({ searchParams }: Props) {
    const params = await searchParams;
    const userId = await getPanelUserId();
    if (!userId) {
        return <UserPageAwaitingAuth />;
    }

    const limit = ITEMS_PER_PAGE;
    const sortBy = params?.sortBy || "createdAt";
    const sortDir = (params?.sortDir || "-") as "+" | "-";
    const search = params?.search || "";
    const status = params?.status || "";

    const { data, total } = await paginatedUserLoans(
        userId, 1, limit, search, sortBy, sortDir, status || undefined,
    );

    return (
        <>
            <TranslatedStatusFilter variant="loans" value={status} basePath="/loans" />
            <LoansList
                loans={serializeClient(data)}
                total={total}
                hasMore={data.length < total}
                search={search}
                sortBy={sortBy}
                sortDir={sortDir}
                status={status}
            />
        </>
    );
}
