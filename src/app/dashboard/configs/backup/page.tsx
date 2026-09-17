import { Title, rem } from "@mantine/core";
import { Suspense } from "react";
import ConfigSkeleton from "../components/ConfigSkeleton";
import LoadBackupConfig from "./components/LoadBackupConfig";

export default async function BackupPage() {
    return (
        <>
            <Title mb={rem(20)} order={4}>Database Backup & Telegram Export</Title>
            <Suspense fallback={<ConfigSkeleton />}>
                <LoadBackupConfig />
            </Suspense>
        </>
    );
}
