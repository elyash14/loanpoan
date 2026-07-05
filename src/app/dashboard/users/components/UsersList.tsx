"use client";
import RichTable from "@dashboard/components/table/RichTable";
import {
  IRichTableData,
  IRichTableSort,
} from "@dashboard/components/table/interface";
import { Button } from "@mantine/core";
import { User } from "@prisma/client";
import { IconUserPlus } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import { ListComponentProps } from "utils/types/generalComponentTypes";
import UserListAction from "./UsersListAction";

type UserListRow = User & { fullName: string };

type props = ListComponentProps & { users: string };

const UsersList = ({
  users,
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
  const { dateType } = useAtomValue(globalConfigAtom);

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
    params.set("search", search);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const data: IRichTableData<UserListRow> = {
    headers: [
      { name: "id", label: "ID", sortable: true },
      { name: "email", label: "Email", sortable: true },
      { name: "fullName", label: "Full Name" },
      { name: "gender", label: "Gender" },
      {
        name: "createdAt",
        label: "Created At",
        sortable: true,
        value: (row) => formatDate(row.createdAt, dateType),
      },
      {
        name: "actions",
        label: "Actions",
        value: UserListAction,
      },
    ],
    rows: JSON.parse(users) as UserListRow[],
  };

  return (
    <RichTable<UserListRow>
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
            href={`/${DASHBOARD_URL}/users/add`}
            component={Link}
            size="xs"
            rightSection={<IconUserPlus size={14} />}
          >
            Add
          </Button>
        </>
      }
    />
  );
};

export default UsersList;
