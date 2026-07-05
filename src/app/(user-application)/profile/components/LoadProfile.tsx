import { getUserProfile } from "@database/user-panel/data";
import { getPanelUserSession } from "utils/auth/userSession";
import ProfileView from "./ProfileView";
import { serializeClient } from "utils/serialize";
import UserPageAwaitingAuth from "../../components/UserPageAwaitingAuth";

export default async function LoadProfile() {
    const session = await getPanelUserSession();
    if (!session) {
        return <UserPageAwaitingAuth />;
    }
    const userId = Number(session.userId);
    const profile = await getUserProfile(userId);

    return (
        <ProfileView
            profile={serializeClient(profile)}
            authProvider={(session.authProvider as string | undefined) ?? "email"}
        />
    );
}
