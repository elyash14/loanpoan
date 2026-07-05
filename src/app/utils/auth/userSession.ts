import "server-only";

import { getSession } from "utils/auth/dataAccessLayer";
import { redirect } from "next/navigation";

export async function getPanelUserId(): Promise<number | null> {
    const session = await getSession();
    return session?.userId ? Number(session.userId) : null;
}

export async function getPanelUserSession() {
    const session = await getSession();
    return session?.userId ? session : null;
}

export async function getRequiredUserId(): Promise<number> {
    const userId = await getPanelUserId();
    if (!userId) {
        redirect("/login");
    }
    return userId;
}

export async function getRequiredUserSession() {
    const session = await getPanelUserSession();
    if (!session) {
        redirect("/login");
    }
    return session;
}

