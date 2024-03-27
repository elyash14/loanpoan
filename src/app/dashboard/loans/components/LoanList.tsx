"use client";
import RichTable from "@dashboard/components/table/RichTable";
import {
  IRichTableData, IRichTableSort
} from "@dashboard/components/table/interface";
import { NumberFormatter, Tooltip } from "@mantine/core";
import { Account } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import LoanListAction from "./LoanListAction";

type props = ListComponentProps & { loans: Account[] }

const LoanList = ({ loans, totalPages, currentPage, pageSize, sortBy, sortDir, search }: props) => {
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
            <Link href={`/${DASHBOARD_URL}/accounts/${row.account.id}/view`}>{row.account.code}</Link>
          </Tooltip>
        )
      },
      {
        name: "amount",
        label: "Amount",
        sortable: true,
        value: (row => <NumberFormatter value={row.amount} thousandSeparator />)
      },
      {
        name: "createdAt",
        label: "Created At",
        sortable: true,
        value: (row => new Date(row.createdAt).toDateString())
      },
      {
        name: "started",
        label: "Started At",
        sortable: true,
        value: (row => new Date(row.startedAt).toDateString())
      },
      {
        name: "finishedAt",
        label: "Finished At",
        sortable: true,
        value: (row => new Date(row.finishedAt).toDateString())
      },
      {
        name: "actions",
        label: "Actions",
        value: LoanListAction
      },
    ],
    rows: JSON.parse(loans as any),
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
    // actions={<>
    //   <Button href={`/${DASHBOARD_URL}/loans/add`} component={Link} size="xs" rightSection={<IconPlus size={14} />} >
    //     Add
    //   </Button>
    // </>}
    />
  );
};

export default LoanList;
