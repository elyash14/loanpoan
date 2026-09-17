import { Title, rem } from "@mantine/core";
import { Suspense } from "react";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { ListPage } from "utils/types/pageTypes";
import LoadTelegramConfig from "./components/LoadTelegramConfig";

export default async function TelegramConfigPage({ searchParams }: ListPage) {
    const resolvedSearchParams = await searchParams;

    return (
        <>
            <Title mb={rem(20)} order={4}>Telegram Settings &amp; Members</Title>
            <Suspense fallback={<ListPageSkeleton />}>
                <LoadTelegramConfig searchParams={resolvedSearchParams} />
            </Suspense>
        </>
    );
}
