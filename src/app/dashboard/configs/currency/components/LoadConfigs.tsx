import { getGlobalConfigs } from "@database/config/data";
import { GlobalConfigType } from "utils/types/configs";
import CurrencyConfig from "./CurrencyConfig";

const LoadConfigs = async () => {
    const config = (await getGlobalConfigs() as GlobalConfigType);

    return <CurrencyConfig currency={config.currency} />;
}

export default LoadConfigs;