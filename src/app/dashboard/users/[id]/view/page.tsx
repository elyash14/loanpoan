import PagePaper from "@dashboard/components/paper/PagePaper";
import { Suspense } from "react";
import { InstancePage } from "utils/types/pageTypes";
import LoadUserView from "./components/LoadUserView";
import UserPageSkeleton from "./components/skeletons/UserPageSkeleton";

export default async function View({ params }: InstancePage) {
    const { id } = await params;

    return (
        <PagePaper>
            <h2>View User</h2>
            <Suspense fallback={<UserPageSkeleton />}>
                <LoadUserView id={Number(id)} />
            </Suspense>
        </PagePaper>
    );
}
