'use client';

import RichTable from "@dashboard/components/table/RichTable";
import { IRichTableData, IRichTableSort } from "@dashboard/components/table/interface";
import { Badge, NumberFormatter, Select } from "@mantine/core";
import { useAtomValue } from "jotai";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import PaymentRequestReviewAction from "./PaymentRequestReviewAction";

type PaymentRequestRow = {
    id: number;
    amount: string;
    receiptFileId: string | null;
    status: string;
    createdAt: string;
    user: { id: number; firstName: string; lastName: string; email: string };
    installments: any[];
    payments: any[];
};

type Props = ListComponentProps & {
    paymentRequests: string;
    status: string;
};

export default function PaymentRequestsList({
    paymentRequests,
    totalPages,
    currentPage,
    pageSize,
    sortBy,
    sortDir,
    search,
    status,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { dateType, currency } = useAtomValue(globalConfigAtom);

    const handleChangePage = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleChangePageSize = (pageSizeNumber: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("limit", pageSizeNumber.toString());
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleSort = (sortable: IRichTableSort) => {
        const params = new URLSearchParams(searchParams);
        params.set("sortBy", sortable.column);
        params.set("sortDir", sortable.dir);
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleSearch = (searchValue: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("search", searchValue);
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleChangeStatus = (statusValue: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("status", statusValue);
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const statusBadge = (statusValue: string) => {
        if (statusValue === "APPROVED") return <Badge color="green">APPROVED</Badge>;
        if (statusValue === "REJECTED") return <Badge color="red">REJECTED</Badge>;
        return <Badge color="blue">PENDING</Badge>;
    };

    const data: IRichTableData<PaymentRequestRow> = {
        headers: [
            { name: "id", label: "ID", sortable: true },
            {
                name: "user",
                label: "User",
                value: (row) => `${row.user.firstName} ${row.user.lastName}`,
            },
            {
                name: "amount",
                label: "Amount",
                sortable: true,
                value: (row) => (
                    <NumberFormatter
                        value={Number(row.amount)}
                        thousandSeparator
                        prefix={`${currency?.symbol} `}
                    />
                ),
            },
            {
                name: "createdAt",
                label: "Submitted Date",
                sortable: true,
                value: (row) => formatDate(new Date(row.createdAt), dateType),
            },
            {
                name: "status",
                label: "Status",
                sortable: true,
                value: (row) => statusBadge(row.status),
            },
            {
                name: "actions",
                label: "Actions",
                value: (row) => <PaymentRequestReviewAction request={row} />,
            },
        ],
        rows: JSON.parse(paymentRequests) as PaymentRequestRow[],
    };

    return (
        <RichTable<PaymentRequestRow>
            data={data}
            hasRowSelector
            totalPages={totalPages}
            currentPage={currentPage}
            handleChangePage={handleChangePage}
            pageSize={pageSize}
            handleChangePageSize={handleChangePageSize}
            sort={{ column: sortBy, dir: sortDir } as IRichTableSort}
            handleSort={handleSort}
            search={search}
            handleSearch={handleSearch}
            actions={
                <Select
                    value={status}
                    size="xs"
                    style={{ float: "right", width: 150, marginRight: 5 }}
                    data={["All", "PENDING", "APPROVED", "REJECTED"]}
                    onChange={(value) => handleChangeStatus(value ?? "All")}
                />
            }
        />
    );
}
