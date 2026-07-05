import PagePaper from "@dashboard/components/paper/PagePaper";
import { Title } from "@mantine/core";
import { Suspense } from "react";
import { AccountIdPage } from "utils/types/pageTypes";
import LoadDataForCreateLoan from "./components/LoadDataForCreateLoan";

export default async function AddAccount({ params }: AccountIdPage) {
    const { accountId } = await params;

    return (
        <PagePaper>
            <Title order={4}>Add New Loan</Title>
            <Suspense fallback={"Loading ..."}>
                <LoadDataForCreateLoan id={Number(accountId)} />
            </Suspense>
        </PagePaper>
    );
}
