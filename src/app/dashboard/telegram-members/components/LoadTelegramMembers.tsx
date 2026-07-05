import { paginatedTelegramMembers } from "@database/telegram/data";
import { getTelegramGroupStats } from "@database/telegram/actions";
import { ITEMS_PER_PAGE } from "utils/configs";
import { PageSearchParams } from "utils/types/pageTypes";
import TelegramMembersList from "./TelegramMembersList";
import TelegramMembersToolbar from "./TelegramMembersToolbar";
import { serializeClient } from "utils/serialize";

export default async function LoadTelegramMembers({
    searchParams,
}: {
    searchParams: PageSearchParams;
}) {
    const search = searchParams?.search || "";
    const page = Number(searchParams?.page) || 1;
    const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE;
    const unlinkedOnly = searchParams?.status === "unlinked";

    const [{ data, total }, stats] = await Promise.all([
        paginatedTelegramMembers(page, limit, search, unlinkedOnly),
        getTelegramGroupStats(),
    ]);

    return (
        <>
            <TelegramMembersToolbar stats={serializeClient(stats)} />
            <TelegramMembersList
                members={serializeClient(data)}
                totalPages={Math.ceil(total / limit)}
                currentPage={page}
                pageSize={limit}
                sortBy="lastSeenAt"
                sortDir="-"
                search={search}
                unlinkedOnly={unlinkedOnly}
            />
        </>
    );
}
