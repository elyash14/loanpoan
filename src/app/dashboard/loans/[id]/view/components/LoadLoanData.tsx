import { getLoan } from "@database/loan/data";
import { notFound } from "next/navigation";
import LoanInfo from "./LoanInfo";

type props = {
    id: number
}

const LoadLoanData = async ({ id }: props) => {
    const { loan, currentPayment } = await getLoan(id);
    if (!loan) {
        notFound();
    }

    return (
        <LoanInfo data={JSON.stringify(loan)} current={JSON.stringify(currentPayment)} />
    );
}

export default LoadLoanData;