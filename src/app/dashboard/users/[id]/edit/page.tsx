import PagePaper from "@dashboard/components/paper/PagePaper";
import { Suspense } from "react";
import { InstancePage } from "utils/types/pageTypes";
import LoadEditData from "./components/LoadEditData";

export default async function Edit({ params }: InstancePage) {
  return (
    <PagePaper>
      <h2>Edit user</h2>
      <Suspense fallback={"Loading ..."}>
        <LoadEditData id={Number(params.id)} />
      </Suspense>
    </PagePaper>
  );
}
