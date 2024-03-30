import PagePaper from "@dashboard/components/paper/PagePaper";
import { Title } from "@mantine/core";
import { Suspense } from "react";
import { ListPage } from "utils/types/pageTypes";
import LoadDataForCreateLoan from "./components/LoadDataForCreateLoan";

type InstancePage = ListPage & {
    params: {
        accountId: string;
    }
}

const AddAccount = ({ params }: InstancePage) => {
    return (
        <PagePaper>
            <Title order={4}>Add New Loan</Title>
            <Suspense fallback={"Loading ..."}>
                <LoadDataForCreateLoan id={Number(params.accountId)} />
            </Suspense>
        </PagePaper>
    );
};

export default AddAccount;