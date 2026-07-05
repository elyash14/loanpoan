"use client";
import RichTable from "@dashboard/components/table/RichTable";
import {
    IRichTableData, IRichTableSort
} from "@dashboard/components/table/interface";
import { statusValue } from "@database/loan/utils";
import { NumberFormatter, Select, Tooltip } from "@mantine/core";
import { Loan, LoanStatus } from "@prisma/client";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import LoanListAction from "./LoanListAction";

type LoanListRow = Loan & {
    account: {
        id: number;
        code: string;
        name: string | null;
        user: { id: number; fullName: string };
    };
};

type props = ListComponentProps & { loans: string; status: string }

const LoanList = ({ loans, totalPages, currentPage, pageSize, sortBy, sortDir, search, status }: props) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { dateType, currency } = useAtomValue(globalConfigAtom);

    const handleChangePage = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleChangePageSize = (pageSize: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('limit', pageSize.toString());
        params.delete('page');
        router.replace(`${pathname}?${params.toString()}`);
    }

    const handleSort = (sortable: IRichTableSort) => {
        const params = new URLSearchParams(searchParams);
        params.set('sortBy', sortable.column);
        params.set('sortDir', sortable.dir);
        router.replace(`${pathname}?${params.toString()}`);
    }

    const handleSearch = (search: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('search', search);
        params.delete('page');
        router.replace(`${pathname}?${params.toString()}`);
    }

    const handleChangeStatus = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('status', value);
        params.delete('page');
        router.replace(`${pathname}?${params.toString()}`);
    }

    const data: IRichTableData<LoanListRow> = {
        headers: [
            { name: "id", label: "ID", sortable: true },
            {
                name: "user",
                label: "User",
                value: (row =>
                    <Tooltip label="View User Profile">
                        <Link href={`/${DASHBOARD_URL}/users/${row.account.user.id}/view`}>{row.account.user.fullName}</Link>
                    </Tooltip>
                )
            },
            {
                name: "account",
                label: "Account",
                value: (row =>
                    <Tooltip label="View The Account">
                        <Link href={`/${DASHBOARD_URL}/accounts/${row.account.id}/view`}>{row.account.code} ({row.account.name})</Link>
                    </Tooltip>
                )
            },
            {
                name: "amount",
                label: "Amount",
                sortable: true,
                value: (row => <NumberFormatter value={Number(row.amount)} thousandSeparator prefix={`${currency?.symbol} `} />)
            },
            {
                name: "paymentCount",
                label: "Payments Count",
                sortable: true,
                value: (row => <Tooltip label="Show All Payments">
                    <Link href={`/${DASHBOARD_URL}/payments?loanId=${row.id}`}>{row.paymentCount}</Link>
                </Tooltip>)
            },
            {
                name: "status",
                label: "Status",
                sortable: true,
                value: (row => statusValue(row.status as LoanStatus))
            },
            {
                name: "startedAt",
                label: "Created At",
                sortable: true,
                value: (row => formatDate(row.startedAt!, dateType))
            },
            {
                name: "finishedAt",
                label: "Finish Date",
                sortable: true,
                value: (row => formatDate(row.finishedAt!, dateType))
            },
            {
                name: "actions",
                label: "Actions",
                value: LoanListAction
            },
        ],
        rows: JSON.parse(loans) as LoanListRow[],
    };

    return (
        <RichTable<LoanListRow>
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
                    data={['All', 'Overdue']}
                    onChange={(value) => handleChangeStatus(value ?? 'All')}
                />
            }
        />
    );
};

export default LoanList;
