import { redirect } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import { ListPage } from "utils/types/pageTypes";

export default async function TelegramMembersRedirectPage({ searchParams }: ListPage) {
    const resolvedSearchParams = await searchParams;
    const query = new URLSearchParams(
        resolvedSearchParams as Record<string, string>,
    ).toString();

    redirect(`/${DASHBOARD_URL}/configs/telegram${query ? `?${query}` : ""}`);
}
