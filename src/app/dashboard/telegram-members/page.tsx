import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconBrandTelegram } from "@tabler/icons-react";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadTelegramMembers from "./components/LoadTelegramMembers";

export default async function TelegramMembersPage({ searchParams }: ListPage) {
    const resolvedSearchParams = await searchParams;

    return (
        <PagePaper>
            <h2><IconBrandTelegram />&nbsp;Telegram group members</h2>
            <Suspense fallback={<ListPageSkeleton />}>
                <LoadTelegramMembers searchParams={resolvedSearchParams} />
            </Suspense>
        </PagePaper>
    );
}
