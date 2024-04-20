"use client";
import RichTable from "@dashboard/components/table/RichTable";
import {
  IRichTableData,
  IRichTableSort,
} from "@dashboard/components/table/interface";
import { Button, NumberFormatter, Tooltip } from "@mantine/core";
import { Installment } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import InstallmentListAction from "./InstallmentListAction";

type props = ListComponentProps & { installment: Installment[] };

const InstallmentList = ({
  installment,
  totalPages,
  currentPage,
  pageSize,
  sortBy,
  sortDir,
  search,
}: props) => {
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
    params.set("page", pageNumber.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleChangePageSize = (pageSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", pageSize.toString());
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSort = (sortable: IRichTableSort) => {
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", sortable.column);
    params.set("sortDir", sortable.dir);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", search.toString());
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  // create RichTable data based on database data and url query params
  const data: IRichTableData = {
    headers: [
      { name: "id", label: "ID", sortable: true },
      {
        name: "installmentAmountId",
        label: "Installment Amount",
        sortable: true,
      },
      {
        name: "accountId",
        label: "Account",
        sortable: true,
        value: (row) => (
          <Tooltip label="View account Profile">
            <Link href={`/${DASHBOARD_URL}/accounts/${row.accountId}/view`}>
              {row.accountId}
            </Link>
          </Tooltip>
        ),
      },
      {
        name: "amount",
        label: "Amount",
        sortable: true,
        value: (row) => (
          <NumberFormatter
            value={row.amount}
            thousandSeparator
            prefix={`${currency?.symbol} `}
          />
        ),
      },
      {
        name: "createdAt",
        label: "Created At",
        sortable: true,
        value: (row) => formatDate(row.createdAt, dateType),
      },
      {
        name: "type",
        label: "Type",
      },
      {
        name: "approvedById",
        label: "Approved By",
      },
      {
        name: "approvedAt",
        label: "Approved At",
        value: (row) => formatDate(row.approvedAt, dateType),
      },

      {
        name: "actions",
        label: "Actions",
        value: InstallmentListAction,
      },
    ],
    rows: JSON.parse(installment as any),
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
        <>
          <Button
            href={`/${DASHBOARD_URL}/installment/add`}
            component={Link}
            size="xs"
            rightSection={<IconPlus size={14} />}
          >
            Add
          </Button>
        </>
      }
    />
  );
};

export default InstallmentList;
