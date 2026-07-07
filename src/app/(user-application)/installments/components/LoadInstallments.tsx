import {
    getUserAccountFilterOptions,
    getUserAccountIfOwned,
    getUserInstallmentsSummary,
    paginatedUserInstallments,
} from "@database/user-panel/data";
import { getPanelUserId } from "utils/auth/userSession";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import InstallmentsList from "./InstallmentsList";
import InstallmentsFilters from "./InstallmentsFilters";
import { serializeClient } from "utils/serialize";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

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
    const from = params?.from || undefined;
    const fromAccount = params?.fromAccount ? Number(params.fromAccount) : undefined;

    if (accountId) {
        await getUserAccountIfOwned(userId, accountId);
    }

    const [accounts, summary, { data, total }] = await Promise.all([
        getUserAccountFilterOptions(userId),
        getUserInstallmentsSummary(userId, accountId),
        paginatedUserInstallments(userId, page, limit, status, search, sortBy, sortDir, accountId),
    ]);

    const queryParams = {
        search,
        sortBy,
        sortDir,
        ...(from ? { from } : {}),
        ...(fromAccount ? { fromAccount: String(fromAccount) } : {}),
        ...(status ? { status } : {}),
        ...(accountId ? { account: String(accountId) } : {}),
    };

    return (
        <>
            <InstallmentsFilters
                status={status}
                accountId={accountId}
                from={from}
                fromAccount={fromAccount}
                accounts={serializeClient(accounts)}
            />
            <InstallmentsList
                installments={serializeClient(data)}
                summary={serializeClient(summary)}
                totalPages={Math.ceil(total / limit)}
                currentPage={page}
                searchParams={queryParams}
            />
        </>
    );
}
