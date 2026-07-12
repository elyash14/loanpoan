"use client";

import { Tabs, rem } from "@mantine/core";
import { IconList, IconListNumbers } from "@tabler/icons-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function LoanTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("view") === "queue" ? "queue" : "list";

    const handleTabChange = (value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value === "queue") {
            params.set("view", "queue");
        } else {
            params.delete("view");
        }
        params.delete("page"); // Reset page on tab change
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <Tabs value={activeTab} onChange={handleTabChange} mb="lg">
            <Tabs.List>
                <Tabs.Tab value="list" leftSection={<IconList style={{ width: rem(16), height: rem(16) }} />}>
                    Loans List
                </Tabs.Tab>
                <Tabs.Tab value="queue" leftSection={<IconListNumbers style={{ width: rem(16), height: rem(16) }} />}>
                    Loan Priority Queue
                </Tabs.Tab>
            </Tabs.List>
        </Tabs>
    );
}
