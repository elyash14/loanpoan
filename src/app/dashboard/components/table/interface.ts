import { ReactNode } from "react";

export interface IRichTableRow {
  id: number;
  [key: string]: any;
}

export interface IRichTableSort {
  column: string;
  dir: RichTableSortDir;
}

export interface IRichTableHeader {
  name: string;
  label?: string;
  value?: (col: any) => string | ReactNode;
  sortable?: boolean;
}

export interface IRichTableData {
  headers: IRichTableHeader[];
  rows: IRichTableRow[];
}
export interface IRichTableProps {
  data: IRichTableData;
  hasRowSelector?: boolean;
  sort?: IRichTableSort;
  handleSort?: (sort: IRichTableSort) => void;
  totalPages?: number;
  currentPage?: number;
  handleChangePage?: (page: number) => void;
  pageSize?: number;
  handleChangePageSize?: (pageSize: number) => void;
  search?: string;
  handleSearch?: (value: string) => void;
  actions?: ReactNode;
}

export interface IRichTableHeadersProps {
  headers: IRichTableHeader[],
  sort?: IRichTableSort;
  handleSort?: (sort: IRichTableSort) => void;
}

export interface IRichTablePaginationProps {
  totalPages: number,
  currentPage: number,
  handleChangePage: (page: number) => void,
}

export interface IRichTablePageSizeProps {
  pageSize: number,
  handleChangePageSize: (pageSize: number) => void,
}

export interface IRichTableSearchProps {
  value?: string,
  handleSearch: (value: string) => void,
}

export type RichTableSortDir = "+" | "-";
