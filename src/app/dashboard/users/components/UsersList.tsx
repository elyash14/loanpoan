"use client";
import RichTable from "@dashboard/components/table/RichTable";
import {
  IRichTableData, IRichTableSort, RichTableSortDir
} from "@dashboard/components/table/interface";
import { User } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type props = {
  users: User[],
  totalPages: number,
  currentPage: number,
  pageSize: number,
  sortBy: string,
  sortDir: RichTableSortDir,
  search: string,
}
const UsersList = ({ users, totalPages, currentPage, pageSize, sortBy, sortDir, search }: props) => {
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
      { name: "email", label: "Email", sortable: true },
      { name: "fullName", label: "Full Name" },
      { name: "gender", label: "Gender" },
      {
        name: "createdAt",
        label: "Created At",
        sortable: true,
        value: (date => new Date(date).toDateString())
      },
    ],
    rows: JSON.parse(users as any),
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
      actions={<>Add new user</>}
    />
  );
};

export default UsersList;
