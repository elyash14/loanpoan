import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { Title, rem } from "@mantine/core";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadInstallmentConfigList from "./components/LoadInstallmentConfigList";

export default async function InstallmentConfig({ searchParams }: ListPage) {
    return <>
        <Title mb={rem(20)} order={4}>Installment Config</Title>
        <Suspense fallback={<ListPageSkeleton />}>
            <LoadInstallmentConfigList searchParams={searchParams} />
        </Suspense>
    </>;;
}
