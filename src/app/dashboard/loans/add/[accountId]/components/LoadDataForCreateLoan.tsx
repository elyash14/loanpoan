import { getAccount } from "@database/account/data";
import { getGlobalConfigs } from "@database/config/data";
import { notFound } from "next/navigation";
import { GlobalConfigType } from "utils/types/configs";
import AddLoanForm from "./AddLoanForm";

type props = {
    id: number
}

const LoadDataForCreateLoan = async ({ id }: props) => {
    const account = await getAccount(id);
    const config = (await getGlobalConfigs() as GlobalConfigType);
    if (!account) {
        notFound();
    }
    return (
        <AddLoanForm
            data={JSON.stringify(account)}
            dateType={config.dateType}
            currency={config.currency}
            loanConfig={config.loan}
        />
    );
}

export default LoadDataForCreateLoan;