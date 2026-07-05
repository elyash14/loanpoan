import { getUserAccountIfOwned } from "@database/user-panel/data";
import { getPanelUserId } from "utils/auth/userSession";
import AccountDetail from "./AccountDetail";
import { serializeClient } from "utils/serialize";
import UserPageAwaitingAuth from "../../../components/UserPageAwaitingAuth";

type Props = { id: number };

export default async function LoadAccountDetail({ id }: Props) {
    const userId = await getPanelUserId();
    if (!userId) {
        return <UserPageAwaitingAuth />;
    }
    const account = await getUserAccountIfOwned(userId, id);
    return <AccountDetail data={serializeClient(account)} />;
}
