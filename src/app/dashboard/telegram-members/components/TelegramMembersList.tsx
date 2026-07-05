"use client";

import RichTable from "@dashboard/components/table/RichTable";
import { IRichTableData } from "@dashboard/components/table/interface";
import { Badge, Select, Text } from "@mantine/core";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import dayjs from "dayjs";

type MemberRow = {
    id: number;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    status: string | null;
    lastSeenAt: string;
    linkedUser: { id: number; fullName: string } | null;
};

type Props = ListComponentProps & {
    members: string;
    unlinkedOnly: boolean;
};

export default function TelegramMembersList({
    members,
    totalPages,
    currentPage,
    pageSize,
    search,
    unlinkedOnly,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChangePage = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleChangePageSize = (size: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("limit", size.toString());
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("search", value);
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleFilterChange = (value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value === "unlinked") {
            params.set("status", "unlinked");
        } else {
            params.delete("status");
        }
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const rows: MemberRow[] = JSON.parse(members);

    const data: IRichTableData<MemberRow> = {
        headers: [
            { name: "telegramId", label: "Telegram ID", sortable: false },
            {
                name: "name",
                label: "Name",
                value: (row) => [row.firstName, row.lastName].filter(Boolean).join(" ") || "—",
            },
            {
                name: "username",
                label: "Username",
                value: (row) => (row.username ? `@${row.username}` : "—"),
            },
            {
                name: "status",
                label: "Status",
                value: (row) => <Badge variant="light">{row.status ?? "member"}</Badge>,
            },
            {
                name: "linkedUser",
                label: "Linked user",
                value: (row) =>
                    row.linkedUser ? (
                        <Link href={`/${DASHBOARD_URL}/users/${row.linkedUser.id}/view`}>
                            {row.linkedUser.fullName}
                        </Link>
                    ) : (
                        <Text c="dimmed" size="sm">Not linked</Text>
                    ),
            },
            {
                name: "lastSeenAt",
                label: "Last seen",
                value: (row) => dayjs(row.lastSeenAt).format("YYYY-MM-DD HH:mm"),
            },
        ],
        rows,
    };

    return (
        <>
            <Select
                mb="md"
                label="Filter"
                value={unlinkedOnly ? "unlinked" : "all"}
                onChange={handleFilterChange}
                data={[
                    { value: "all", label: "All stored members" },
                    { value: "unlinked", label: "Unlinked only" },
                ]}
                w={260}
            />
            <RichTable<MemberRow>
                data={data}
                totalPages={totalPages}
                currentPage={currentPage}
                handleChangePage={handleChangePage}
                pageSize={pageSize}
                handleChangePageSize={handleChangePageSize}
                search={search}
                handleSearch={handleSearch}
            />
        </>
    );
}
