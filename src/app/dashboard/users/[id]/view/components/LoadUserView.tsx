import { getUserForView, getUserRelatedData } from "@database/user/data";
import { notFound } from "next/navigation";
import UserViewTabs from "./UserViewTabs";
import { serializeClient } from "utils/serialize";

type props = {
    id: number;
};

const LoadUserView = async ({ id }: props) => {
    const [user, related] = await Promise.all([
        getUserForView(id),
        getUserRelatedData(id),
    ]);

    if (!user) {
        notFound();
    }

    return (
        <UserViewTabs
            userData={serializeClient(user)}
            accountsData={JSON.stringify(related.accounts)}
            accountsCount={related.accountsCount}
            loansCount={related.loansCount}
            installmentsCount={related.installmentsCount}
            currentLoanData={JSON.stringify(related.currentLoan)}
            installmentsPaidCount={related.installmentsPaidCount}
            latestInstallmentsData={JSON.stringify(related.latestInstallments)}
        />
    );
};

export default LoadUserView;
