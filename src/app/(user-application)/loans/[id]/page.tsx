import UserShell from "../../components/shell/UserShell";
import TelegramBackButton from "../../components/telegram/TelegramBackButton";
import LoadLoanDetail from "./components/LoadLoanDetail";
import { Suspense } from "react";
import { Skeleton } from "../../components/ui/skeleton";

type Props = { params: Promise<{ id: string }> };

export default async function LoanDetailPage({ params }: Props) {
    const { id } = await params;
    return (
        <UserShell title="Loan" hideNav>
            <TelegramBackButton />
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <LoadLoanDetail id={Number(id)} />
            </Suspense>
        </UserShell>
    );
}
