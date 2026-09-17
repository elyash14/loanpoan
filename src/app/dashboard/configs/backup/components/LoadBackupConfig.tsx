import { getBackupOverviewAction } from "@database/backup/actions";
import { serializeClient } from "utils/serialize";
import BackupManager from "./BackupManager";

export default async function LoadBackupConfig() {
    const overview = await getBackupOverviewAction();
    return <BackupManager initialData={serializeClient(overview)} />;
}
