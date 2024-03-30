
import { getGlobalConfigs } from "@database/config/data";
import { GlobalConfigType } from "utils/types/configs";
import LoanConfig from "./LoanConfig";

const LoadConfigs = async () => {
    const config = (await getGlobalConfigs() as GlobalConfigType);

    return <LoanConfig loanConfig={config.loan} />;
}

export default LoadConfigs;