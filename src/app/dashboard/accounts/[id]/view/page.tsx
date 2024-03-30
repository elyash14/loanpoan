import PagePaper from "@dashboard/components/paper/PagePaper";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { InstancePage } from "utils/types/pageTypes";

export default async function View({ params }: InstancePage) {
    return (
        <PagePaper>
            <h2>View Account</h2>
            {params.id}
            <br />
            <Link href={`/${DASHBOARD_URL}/loans/add/${params.id}`}>Create a loan for this account</Link>
        </PagePaper>
    );
}
