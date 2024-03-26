"use client";
import RichTable from "@dashboard/components/table/RichTable";
import {
  IRichTableData, IRichTableSort
} from "@dashboard/components/table/interface";
import { Button, NumberFormatter } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { InstallmentAmount } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import AddNewInstallmentAmount from "./AddNewInstallmentAmount";

type props = ListComponentProps & { installments: InstallmentAmount[] }

const InstallmentAmountList = ({ installments, totalPages, currentPage, pageSize, sortBy, sortDir }: props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [opened, { open, close }] = useDisclosure(false);

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

  // create RichTable data based on database data and url query params
  const data: IRichTableData = {
    headers: [
      { name: "id", label: "ID", sortable: true },
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
        name: "deprecatedAt",
        label: "Deprecated At",
        sortable: true,
        value: (row => row.deprecatedAt ? new Date(row.deprecatedAt).toDateString() : '---')
      },
    ],
    rows: JSON.parse(installments as any),
  };

  return (<>
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
      actions={<>
        <Button onClick={open} size="xs" rightSection={<IconPlus size={14} />} >
          Add
        </Button>
      </>}
    />
    <AddNewInstallmentAmount opened={opened} close={close} />
  </>
  );
};

export default InstallmentAmountList;
