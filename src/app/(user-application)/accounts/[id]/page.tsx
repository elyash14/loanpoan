import UserShell from "../../components/shell/UserShell";
import LoadAccountDetail from "./components/LoadAccountDetail";
import { Suspense } from "react";
import { Skeleton } from "../../components/ui/skeleton";

type Props = { params: Promise<{ id: string }> };

export default async function AccountDetailPage({ params }: Props) {
    const { id } = await params;
    return (
        <UserShell titleKey="pages.account" showBack backHref="/accounts">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadAccountDetail id={Number(id)} />
            </Suspense>
        </UserShell>
    );
}
