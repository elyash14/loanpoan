import UserShell from "../components/shell/UserShell";
import LoadProfile from "./components/LoadProfile";
import { Suspense } from "react";
import { Skeleton } from "../components/ui/skeleton";

export default function ProfilePage() {
    return (
        <UserShell titleKey="pages.profile" descriptionKey="more.profileDesc" showBack backHref="/more">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadProfile />
            </Suspense>
        </UserShell>
    );
}
