import { getPanelUserSession } from "utils/auth/userSession";
import { getUserPanelOverview, getSystemAbstractStats } from "@database/user-panel/data";
import HomeOverview from "./HomeOverview";
import { serializeClient } from "utils/serialize";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

export default async function LoadHome() {
    const session = await getPanelUserSession();
    if (!session) {
        return <UserPageAwaitingAuth />;
    }
    const userId = Number(session.userId);
    const [{ related, stats }, systemStats] = await Promise.all([
        getUserPanelOverview(userId),
        getSystemAbstractStats(),
    ]);

    return (
        <HomeOverview
            fullName={String(session.fullName)}
            stats={serializeClient(stats)}
            related={serializeClient(related)}
            systemStats={serializeClient(systemStats)}
        />
    );
}
