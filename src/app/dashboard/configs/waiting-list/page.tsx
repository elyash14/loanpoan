import { Title, rem } from "@mantine/core";
import { Suspense } from "react";
import ConfigSkeleton from "../components/ConfigSkeleton";
import LoadWaitingListConfigs from "./components/LoadWaitingListConfigs";


export default async function WaitingList() {
    return <>
        <Title mb={rem(20)} order={4}>Waiting List</Title>
        <Suspense fallback={<ConfigSkeleton />}>
            <LoadWaitingListConfigs />
        </Suspense>
    </>;
}
