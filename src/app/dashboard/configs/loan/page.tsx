import { Title, rem } from "@mantine/core";
import { Suspense } from "react";
import ConfigSkeleton from "../components/ConfigSkeleton";
import LoadConfigs from "./components/LoadConfigs";


export default async function General() {
    return <>
        <Title mb={rem(20)} order={4}>Loan Config</Title>
        <Suspense fallback={<ConfigSkeleton />}>
            <LoadConfigs />
        </Suspense>
    </>;
}
