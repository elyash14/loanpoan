import { paginatedUserPayments } from "@database/user-panel/data";
import { getPanelUserId } from "utils/auth/userSession";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import PaymentsList from "./PaymentsList";
import { serializeClient } from "utils/serialize";
import TranslatedStatusFilter from "../../components/TranslatedStatusFilter";
import { paginatedPaymentsList } from "@database/payment/data";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

type Props = { searchParams: Promise<PageSearchParams> };

export default async function LoadPayments({ searchParams }: Props) {
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
    const loanId = params?.loan ? Number(params.loan) : undefined;

    const { data, total } = loanId
        ? await paginatedPaymentsList(page, limit, status, loanId, search, sortBy, sortDir, userId)
        : await paginatedUserPayments(userId, page, limit, status, search, sortBy, sortDir);

    return (
        <>
            <TranslatedStatusFilter variant="payments" value={status} basePath="/payments" />
            <PaymentsList
                payments={serializeClient(data)}
                totalPages={Math.ceil(total / limit)}
                currentPage={page}
                searchParams={{
                    search, sortBy, sortDir,
                    ...(status ? { status } : {}),
                    ...(loanId ? { loan: String(loanId) } : {}),
                }}
            />
        </>
    );
}
