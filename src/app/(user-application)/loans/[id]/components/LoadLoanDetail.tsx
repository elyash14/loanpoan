import { getUserLoanIfOwned } from "@database/user-panel/data";
import { getPanelUserId } from "utils/auth/userSession";
import LoanDetail from "./LoanDetail";
import { serializeClient } from "utils/serialize";
import UserPageAwaitingAuth from "../../../components/UserPageAwaitingAuth";

type Props = { id: number };

export default async function LoadLoanDetail({ id }: Props) {
    const userId = await getPanelUserId();
    if (!userId) {
        return <UserPageAwaitingAuth />;
    }
    const loan = await getUserLoanIfOwned(userId, id);
    return <LoanDetail data={serializeClient(loan)} />;
}
