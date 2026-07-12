"use server";

import { getSession } from "utils/auth/dataAccessLayer";
import { reorderLoanQueueEntry, resetLoanQueueToAuto } from "./queue";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";

export async function reorderQueueAction(accountId: number, newPosition: number, note?: string) {
    const session = await getSession();
    if (!session?.userId) {
        return { status: "ERROR", message: "Unauthorized" };
    }

    try {
        await reorderLoanQueueEntry(accountId, newPosition, Number(session.userId), note);
        revalidatePath(`/${DASHBOARD_URL}/loans`);
        return { status: "SUCCESS", message: "Queue reordered successfully" };
    } catch (error: any) {
        console.error(error);
        return { status: "ERROR", message: error.message || "Failed to reorder queue" };
    }
}

export async function resetQueueAction() {
    const session = await getSession();
    if (!session?.userId) {
        return { status: "ERROR", message: "Unauthorized" };
    }

    try {
        await resetLoanQueueToAuto();
        revalidatePath(`/${DASHBOARD_URL}/loans`);
        return { status: "SUCCESS", message: "Queue reset to automatic order" };
    } catch (error: any) {
        console.error(error);
        return { status: "ERROR", message: error.message || "Failed to reset queue" };
    }
}
