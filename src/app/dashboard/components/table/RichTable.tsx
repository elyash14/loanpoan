"use client";

import { Box, Checkbox, Table } from "@mantine/core";
import { FC, useMemo, useState } from "react";
import Headers from "./Headers";
import PageSize from "./PageSize";
import Pagination from "./Pagination";
import classes from "./RichTable.module.css";
import Search from "./Search";
import { IRichTableProps } from "./interface";

const RichTable: FC<IRichTableProps> = (props) => {
  const {
    data,
    hasRowSelector = false,
    sort,
    handleSort,
    currentPage = 1,
    totalPages = 1,
    handleChangePage,
    pageSize = 10,
    handleChangePageSize,
    search = "",
    handleSearch,
    actions,
    bottomActions,
  } = props;

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const rows = useMemo(() => {
    return data.rows.map((row) => (
      <Table.Tr
        key={row.id}
        bg={
          selectedRows.includes(row.id)
            ? "var(--mantine-color-gray-light)"
            : undefined
        }
      >
        {hasRowSelector && (
          <Table.Td>
            <Checkbox
              size="xs"
              aria-label="Select row"
              checked={selectedRows.includes(row.id)}
              onChange={(event) =>
                setSelectedRows(
                  event.currentTarget.checked
                    ? [...selectedRows, row.id]
                    : selectedRows.filter((id) => id !== row.id),
                )
              }
            />
          </Table.Td>
        )}
        {data.headers.map((header) => {
          const value = header.value ? header.value(row) : row[header.name];
          return <Table.Td key={`${row.id}-${header.name}`}>{value}</Table.Td>;
        })}
      </Table.Tr>
    ));
  }, [data, selectedRows]);

  return (
    <Box>
      <Box className={classes.topActions}>
        <Box flex={1}>{actions}</Box>
        {handleSearch && <Search handleSearch={handleSearch} value={search} />}
        {handleChangePageSize && (
          <PageSize
            pageSize={pageSize}
            handleChangePageSize={handleChangePageSize}
          />
        )}
      </Box>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {hasRowSelector && (
              <Table.Th className={classes.checkboxHeader}>
                <Checkbox
                  size="xs"
                  aria-label="Select all row"
                  checked={selectedRows.length === data.rows.length}
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < data.rows.length
                  }
                  onChange={(event) =>
                    setSelectedRows(
                      event.currentTarget.checked
                        ? data.rows.map((row) => row.id)
                        : [],
                    )
                  }
                />
              </Table.Th>
            )}
            <Headers
              headers={data.headers}
              sort={sort}
              handleSort={handleSort}
            />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      <Box className={classes.footer}>
        <Box flex={1}>
          {handleChangePage && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              handleChangePage={handleChangePage}
            />
          )}
        </Box>
        {bottomActions && <Box>{bottomActions}</Box>}
      </Box>
    </Box>
  );
};

export default RichTable;
