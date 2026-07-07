import { getPanelUserSession } from "utils/auth/userSession";
import { getUserHomeDashboard } from "@database/user-panel/data";
import HomeOverview from "./HomeOverview";
import { serializeClient } from "utils/serialize";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

export default async function LoadHome() {
    const session = await getPanelUserSession();
    if (!session) {
        return <UserPageAwaitingAuth />;
    }
    const userId = Number(session.userId);
    const dashboard = await getUserHomeDashboard(userId);

    return (
        <HomeOverview
            fullName={String(session.fullName)}
            dashboard={serializeClient(dashboard)}
        />
    );
}
