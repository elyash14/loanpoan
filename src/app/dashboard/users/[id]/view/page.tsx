import PagePaper from "@dashboard/components/paper/PagePaper";
import { InstancePage } from "utils/types/pageTypes";

export default async function View({ params }: InstancePage) {
    const { id } = await params;

    return (
        <PagePaper>
            <h2>View User</h2>
            {id}
        </PagePaper>
    );
}
