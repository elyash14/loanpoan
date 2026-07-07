import {
    getUserLoanFilterOptions,
    getUserLoanIfOwned,
    getUserPaymentsSummary,
    paginatedUserPayments,
} from "@database/user-panel/data";
import { getPanelUserId } from "utils/auth/userSession";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import PaymentsList from "./PaymentsList";
import PaymentsFilters from "./PaymentsFilters";
import { serializeClient } from "utils/serialize";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

type Props = { searchParams: Promise<PageSearchParams> };

export default async function LoadPayments({ searchParams }: Props) {
    const params = await searchParams;
    const userId = await getPanelUserId();
    if (!userId) {
        return <UserPageAwaitingAuth />;
    }

    const limit = ITEMS_PER_PAGE;
    const sortBy = params?.sortBy || "dueDate";
    const sortDir = (params?.sortDir || "-") as "+" | "-";
    const search = params?.search || "";
    const status = params?.status || "";
    const loanId = params?.loan ? Number(params.loan) : undefined;
    const from = params?.from || undefined;
    const fromLoan = params?.fromLoan ? Number(params.fromLoan) : undefined;

    if (loanId) {
        await getUserLoanIfOwned(userId, loanId);
    }

    const [loans, summary, { data, total }] = await Promise.all([
        getUserLoanFilterOptions(userId),
        getUserPaymentsSummary(userId, loanId),
        paginatedUserPayments(userId, 1, limit, status, search, sortBy, sortDir, loanId),
    ]);

    return (
        <>
            <PaymentsFilters
                status={status}
                loanId={loanId}
                from={from}
                fromLoan={fromLoan}
                loans={serializeClient(loans)}
            />
            <PaymentsList
                payments={serializeClient(data)}
                summary={serializeClient(summary)}
                total={total}
                hasMore={data.length < total}
                status={status}
                search={search}
                sortBy={sortBy}
                sortDir={sortDir}
                loanId={loanId}
            />
        </>
    );
}
