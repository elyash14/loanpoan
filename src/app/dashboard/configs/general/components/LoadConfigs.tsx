import { getGlobalConfigs } from "@database/config/data";
import { GlobalConfigType } from "utils/types/configs";

const LoadConfigs = async () => {
    const config = (await getGlobalConfigs() as GlobalConfigType);

    return <h1>{config?.currency?.name}</h1>;
}

export default LoadConfigs;