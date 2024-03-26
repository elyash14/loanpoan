
import { getGlobalConfigs } from "@database/config/data";
import { GlobalConfigType } from "utils/types/configs";
import GeneralConfig from "./GeneralConfig";

const LoadConfigs = async () => {
    const config = (await getGlobalConfigs() as GlobalConfigType);

    return <GeneralConfig applicationName={config.applicationName} />;
}

export default LoadConfigs;