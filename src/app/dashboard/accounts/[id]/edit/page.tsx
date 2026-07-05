import PagePaper from "@dashboard/components/paper/PagePaper";
import { Suspense } from "react";
import { InstancePage } from "utils/types/pageTypes";
import LoadAccountData from "./components/LoadAccountData";

export default async function Edit({ params }: InstancePage) {
    const { id } = await params;

    return (
        <PagePaper>
            <h2>Edit Account</h2>
            <Suspense fallback={"Loading ..."}>
                <LoadAccountData id={Number(id)} />
            </Suspense>
        </PagePaper>
    );
}
