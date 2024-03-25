import PagePaper from "@dashboard/components/paper/PagePaper";
import { InstancePage } from "utils/types/pageTypes";

export default async function View({ params }: InstancePage) {
    return (
        <PagePaper>
            <h2>View Account</h2>
            {params.id}
        </PagePaper>
    );
}
