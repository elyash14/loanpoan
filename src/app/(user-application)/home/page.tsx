import UserShell from "../components/shell/UserShell";
import LoadHome from "./components/LoadHome";
import { Suspense } from "react";
import { Skeleton } from "../components/ui/skeleton";

export default function HomePage() {
    return (
        <UserShell titleKey="pages.overview">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadHome />
            </Suspense>
        </UserShell>
    );
}
