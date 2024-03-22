import PagePaper from "@dashboard/components/paper/PagePaper";
import { InstancePage } from "utils/types/pageTypes";

export default async function View({ params }: InstancePage) {
    return (
        <PagePaper>
            <h2>View User</h2>
            {params.id}
        </PagePaper>
    );
}
