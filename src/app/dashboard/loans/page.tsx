import PagePaper from "@dashboard/components/paper/PagePaper";
import ListPageSkeleton from "@dashboard/components/skeleton/ListPageSkeleton";
import { IconMoneybag } from "@tabler/icons-react";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadLoanList from "./components/LoadLoanList";
import LoanTabs from "./components/LoanTabs";
import LoanPriorityList from "./components/LoanPriorityList";
import { getLoanPriorityQueue } from "@database/loan/queue";

export default async function Loans({ searchParams }: ListPage) {
    const resolvedSearchParams = await searchParams;
    const accountId = resolvedSearchParams?.account ? parseInt(resolvedSearchParams.account) : undefined;
    const view = (resolvedSearchParams as any)?.view;

    return (
        <PagePaper>
            <h2><IconMoneybag />&nbsp;Loans</h2>
            <LoanTabs />
            <Suspense fallback={<ListPageSkeleton />}>
                {view === "queue" ? (
                    <LoadLoanPriorityQueue />
                ) : (
                    <LoadLoanList searchParams={{ ...resolvedSearchParams, account: accountId?.toString() }} />
                )}
            </Suspense>
        </PagePaper>
    );
}

async function LoadLoanPriorityQueue() {
    const queue = await getLoanPriorityQueue();
    return <LoanPriorityList queueJson={JSON.stringify(queue)} />;
}
