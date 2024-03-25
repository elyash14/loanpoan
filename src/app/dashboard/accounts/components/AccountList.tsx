"use client";
import RichTable from "@dashboard/components/table/RichTable";
import {
  IRichTableData, IRichTableSort
} from "@dashboard/components/table/interface";
import { Button, NumberFormatter, Tooltip } from "@mantine/core";
import { Account } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import AccountListAction from "./AccountListAction";

type props = ListComponentProps & { accounts: Account[] }

const AccountList = ({ accounts, totalPages, currentPage, pageSize, sortBy, sortDir, search }: props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  // create RichTable data based on database data and url query params
  const data: IRichTableData = {
    headers: [
      { name: "id", label: "ID", sortable: true },
      { name: "code", label: "Code", sortable: true },
      {
        name: "installmentFactor",
        label: "Installment Factor",
        sortable: true,
      },
      {
        name: "balance",
        label: "Balance",
        sortable: true,
        value: (row => <NumberFormatter value={row.balance} thousandSeparator />)
      },
      {
        name: "user",
        label: "User",
        value: (row =>
          <Tooltip label="View User Profile">
            <Link href={`/${DASHBOARD_URL}/users/${row.user.id}/view`}>{row.user.fullName}</Link>
          </Tooltip>
        )
      },
      {
        name: "updatedAt",
        label: "Updated At",
        sortable: true,
        value: (row => new Date(row.updatedAt).toDateString())
      },
      {
        name: "actions",
        label: "Actions",
        value: AccountListAction
      },
    ],
    rows: JSON.parse(accounts as any),
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
      actions={<>
        <Button href={`/${DASHBOARD_URL}/accounts/add`} component={Link} size="xs" rightSection={<IconPlus size={14} />} >
          Add
        </Button>
      </>}
    />
  );
};

export default AccountList;
