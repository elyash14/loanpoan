'use client';
import { Pagination as MPagination } from "@mantine/core";
import { FC } from "react";
import { IRichTablePaginationProps } from "./interface";

const Pagination: FC<IRichTablePaginationProps> = ({ totalPages, currentPage, handleChangePage }) => {

    return <MPagination gap={3} size="sm" total={totalPages} value={currentPage} onChange={handleChangePage} mt="xs" />
}

export default Pagination;