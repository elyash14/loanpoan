import { getAccountFullRelationData } from "@database/account/data";
import { notFound } from "next/navigation";
import AccountInfo from "./AccountInfo";

type props = {
    id: number
}

const LoadAccountData = async ({ id }: props) => {
    const { account, currentLoan } = await getAccountFullRelationData(id);
    if (!account) {
        notFound();
    }

    return (
        <AccountInfo data={JSON.stringify(account)} currentLoanData={JSON.stringify(currentLoan)} />
    );
}

export default LoadAccountData;