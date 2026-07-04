import { getAccountOtherData } from "@database/account/data";
import AccountOtherInfo from "./AccountOtherInfo";

type props = {
    id: number
}

const LoadAccountOtherData = async ({ id }: props) => {
    const { loansCount, currentLoan, installmentsCount, latestInstallments } = await getAccountOtherData(id);

    return (
        <AccountOtherInfo id={id}
            loansCount={loansCount}
            currentLoanData={JSON.stringify(currentLoan)}
            installmentsCount={installmentsCount}
            latestInstallmentsData={JSON.stringify(latestInstallments)} />
    );
}

export default LoadAccountOtherData;