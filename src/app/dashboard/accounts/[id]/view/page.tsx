import PagePaper from "@dashboard/components/paper/PagePaper";
import { Suspense } from "react";
import { InstancePage } from "utils/types/pageTypes";
import LoadAccountData from "./components/LoadAccountData";
import LoadAccountOtherData from "./components/LoadAccountOtherData";
import AccountOtherInfoPageSkeleton from "./components/skeletons/AccountOtherInfoPageSkeleton";
import AccountPageSkeleton from "./components/skeletons/AccountPageSkeleton";

export default async function View({ params }: InstancePage) {
    const { id } = await params;

    return (
        <>
            <PagePaper>
                <h2>View Account</h2>
                <Suspense fallback={<AccountPageSkeleton />}>
                    <LoadAccountData id={Number(id)} />
                </Suspense>
            </PagePaper>
            <PagePaper>
                <Suspense fallback={<AccountOtherInfoPageSkeleton />}>
                    <LoadAccountOtherData id={Number(id)} />
                </Suspense>
            </PagePaper>
        </>
    );
}
