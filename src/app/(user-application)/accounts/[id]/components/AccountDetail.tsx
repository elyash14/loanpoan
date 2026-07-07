'use client';

import { useMemo } from "react";
import AccountActions from "./AccountActions";
import AccountHero from "./AccountHero";
import AccountTimeline from "./AccountTimeline";
import type { AccountDetailData } from "./types";

export default function AccountDetail({ data }: { data: string }) {
    const account = useMemo(() => JSON.parse(data) as AccountDetailData, [data]);

    return (
        <div className="space-y-4">
            <AccountHero account={account} />
            <AccountActions account={account} />
            <AccountTimeline account={account} />
        </div>
    );
}
