"use client";
import RichTable from "@dashboard/components/table/RichTable";
import {
    IRichTableData, IRichTableSort
} from "@dashboard/components/table/interface";
import { Box, Button, NumberFormatter, Select, Tooltip } from "@mantine/core";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import GenerateMonthlyInstallments from "./GenerateMonthlyInstallments";
import InstallmentListAction from "./InstallmentListAction";
import { InstallmentListRow } from "./InstallmentDetailsModal";

type props = ListComponentProps & {
    payments: string,
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

    const data: IRichTableData<InstallmentListRow> = {
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
                value: (row => <NumberFormatter value={Number(row.amount)} thousandSeparator prefix={`${currency?.symbol} `} />)
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
                name: "paidAt",
                label: "Paid At",
                sortable: true,
                value: (row => formatDate(row.paidAt!, dateType))
            },
            {
                name: "actions",
                label: "Actions",
                value: InstallmentListAction
            },
        ],
        rows: JSON.parse(payments) as InstallmentListRow[],
    };

    return (
        <RichTable<InstallmentListRow>
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
                <Box style={{ display: 'flex', gap: 5 }}>
                    <Select
                        defaultValue={status}
                        size="xs"
                        style={{ float: "right", width: 150, marginRight: 5 }}
                        data={['All', 'Paid', 'Not Paid']}
                        onChange={(_value, option) => handleChangeStatus(option.value)}
                    />
                    <GenerateMonthlyInstallments />
                </Box>
            }
            bottomActions={loanId ?
                <Button size="xs" variant="default" component={Link} href={`/${DASHBOARD_URL}/loans/${loanId}/view`}>Back To Loan</Button>
                : accountId ?
                    <Button size="xs" variant="default" component={Link} href={`/${DASHBOARD_URL}/accounts/${accountId}/view`}>Back To Account</Button>
                    : null}
        />
    );
};

export default InstallmentsList;
