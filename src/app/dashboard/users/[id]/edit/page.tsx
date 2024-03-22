import PagePaper from "@dashboard/components/paper/PagePaper";
import { InstancePage } from "utils/types/pageTypes";

export default async function Edit({ params }: InstancePage) {
    return (
        <PagePaper>
            <h2>Edit User</h2>
            {params.id}
        </PagePaper>
    );
}
