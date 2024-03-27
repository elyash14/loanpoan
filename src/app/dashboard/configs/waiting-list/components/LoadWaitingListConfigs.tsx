
import { getWaitingListConfigs } from "@database/config/data";
import { GlobalConfigType } from "utils/types/configs";

const LoadWaitingListConfigs = async () => {
    const config = (await getWaitingListConfigs() as GlobalConfigType);

    console.log('final ', config);

    return <h1>asdasdsadadd</h1>

    // return <GeneralConfig applicationName={config.applicationName} />;
}

export default LoadWaitingListConfigs;