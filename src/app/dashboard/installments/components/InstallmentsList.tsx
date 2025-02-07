"use client";
import RichTable from "@dashboard/components/table/RichTable";
import {
    IRichTableData, IRichTableSort
} from "@dashboard/components/table/interface";
import { Box, NumberFormatter, Select, Tooltip } from "@mantine/core";
import { Payment } from "@prisma/client";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import GenerateMonthlyInstallments from "./GenerateMonthlyInstallments";
import InstallmentListAction from "./InstallmentListAction";

type props = ListComponentProps & {
    payments: Payment[],
    status: string,
    loanId: number,
    accountId?: number
}

const InstallmentsList = (props: props) => {
    const { payments, totalPages, currentPage, pageSize, sortBy, sortDir, search, status, loanId, accountId } = props;
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { dateType, currency } = useAtomValue(globalConfigAtom);

    /**
     *  in all handler we change the url query params and navigate user
     *  to the new url to fire new prisma query 
     */
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

    const handleChangeStatus = (status: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('status', status);
        router.replace(`${pathname}?${params.toString()}`);
    }


    // create RichTable data based on database data and url query params
    const data: IRichTableData = {
        headers: [
            { name: "id", label: "ID", sortable: true },
            {
                name: "account",
                label: "Account",
                value: (row =>
                    <Tooltip label="View The Account">
                        <Link href={`/${DASHBOARD_URL}/accounts/${row.account.id}/view`}>
                            {row.account.code} - ({row.account.user.fullName})
                        </Link>
                    </Tooltip>
                )
            },
            {
                name: "amount",
                label: "Amount",
                sortable: true,
                value: (row => <NumberFormatter value={row.amount} thousandSeparator prefix={`${currency?.symbol} `} />)
            },
            {
                name: "type",
                label: "Type",
                sortable: true,
            },
            {
                name: "dueDate",
                label: "Due Date",
                sortable: true,
                value: (row => formatDate(row.dueDate, dateType))
            },
            {
                name: "payedAt",
                label: "Paid At",
                sortable: true,
                value: (row => formatDate(row.payedAt, dateType))
            },
            {
                name: "actions",
                label: "Actions",
                value: InstallmentListAction
            },
        ],
        rows: JSON.parse(payments as any),
    };

    return (
        <RichTable
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
                <Box>
                    {!accountId && <GenerateMonthlyInstallments />}
                    <Select
                        defaultValue={status}
                        size="xs"
                        style={{ float: "right", width: 150, marginRight: 5 }}
                        data={['All', 'Paid', 'Not Paid']}
                        onChange={(_value, option) => handleChangeStatus(option.value)}
                    />
                </Box>
            }
        />
    );
};

export default InstallmentsList;
