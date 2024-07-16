
import { getGlobalConfigs } from "@database/config/data";
import { GlobalConfigType } from "utils/types/configs";
import InstallmentDates from "./InstallmentDates";

const LoadConfigs = async () => {
    const config = (await getGlobalConfigs() as GlobalConfigType);

    return <InstallmentDates installment={config.installment ?? { dueDay: 1, payDay: 5 }} />
}

export default LoadConfigs;