import { getAccountOtherData } from "@database/account/data";
import AccountOtherInfo from "./AccountOtherInfo";

type props = {
    id: number
}

const LoadAccountOtherData = async ({ id }: props) => {
    const { loansCount, currentLoan } = await getAccountOtherData(id);

    return (
        <AccountOtherInfo id={id} loansCount={loansCount} currentLoanData={JSON.stringify(currentLoan)} />
    );
}

export default LoadAccountOtherData;