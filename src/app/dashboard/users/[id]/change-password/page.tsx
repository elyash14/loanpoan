import PagePaper from "@dashboard/components/paper/PagePaper";
import { Suspense } from "react";
import { InstancePage } from "utils/types/pageTypes";
import LoadPasswordData from "./components/LoadPasswordData";

export default async function Edit({ params }: InstancePage) {
  const { id } = await params;

  return (
    <PagePaper>
      <h2>Change Password</h2>
      <Suspense fallback={"Loading ..."}>
        <LoadPasswordData id={Number(id)} />
      </Suspense>
    </PagePaper>
  );
}
