import { RichTableSortDir } from "@dashboard/components/table/interface";

export type ListComponentProps = {
    totalPages: number,
    currentPage: number,
    pageSize: number,
    sortBy: string,
    sortDir: RichTableSortDir,
    search: string,
}