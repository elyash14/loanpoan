import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { Divider, Title, rem } from "@mantine/core";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadConfigs from "./components/LoadConfigs";
import LoadInstallmentConfigList from "./components/LoadInstallmentConfigList";

export default async function InstallmentConfig({ searchParams }: ListPage) {
    return <>
        <Title mb={rem(20)} order={4}>Installment Dates</Title>
        <Suspense fallback={<ListPageSkeleton />}>
            <LoadConfigs />
        </Suspense>
        <Divider my={rem(20)} />
        <Title mb={rem(20)} order={4}>Installment Amounts</Title>
        <Suspense fallback={<ListPageSkeleton />}>
            <LoadInstallmentConfigList searchParams={searchParams} />
        </Suspense>
    </>;
}
