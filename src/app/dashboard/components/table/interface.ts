import { ReactNode } from "react";

export interface IRichTableRow {
  id: number;
}

export interface IRichTableSort {
  column: string;
  dir: RichTableSortDir;
}

export interface IRichTableHeader<TRow extends IRichTableRow = IRichTableRow> {
  name: string;
  label?: string;
  value?: (col: TRow) => string | ReactNode;
  sortable?: boolean;
}

export interface IRichTableData<TRow extends IRichTableRow = IRichTableRow> {
  headers: IRichTableHeader<TRow>[];
  rows: TRow[];
}

export interface IRichTableProps<TRow extends IRichTableRow = IRichTableRow> {
  data: IRichTableData<TRow>;
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
  bottomActions?: ReactNode;
}

export interface IRichTableHeadersProps<TRow extends IRichTableRow = IRichTableRow> {
  headers: IRichTableHeader<TRow>[];
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
