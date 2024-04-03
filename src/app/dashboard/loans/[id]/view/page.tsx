import PagePaper from "@dashboard/components/paper/PagePaper";
import { Suspense } from "react";
import { InstancePage } from "utils/types/pageTypes";
import LoadLoanData from "./components/LoadLoanData";
import LoanPageSkeleton from "./components/LoanPageSkeleton";

export default async function View({ params }: InstancePage) {
    return (
        <PagePaper>
            <h2>View Loan</h2>
            <Suspense fallback={<LoanPageSkeleton />}>
                <LoadLoanData id={Number(params.id)} />
            </Suspense>
        </PagePaper>
    );
}
