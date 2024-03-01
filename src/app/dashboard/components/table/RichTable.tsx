'use client';

import { Checkbox, Table } from "@mantine/core";
import { FC, useState } from "react";
import classes from './RichTable.module.css';
import Sortable from "./Sortable";
import { IRichTableProps } from "./interface";

const RichTable: FC<IRichTableProps> = (props) => {
    const { data, hasRowSelector = false, sort, handleSort } = props;

    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const rows = data.rows.map((row) => (
        <Table.Tr
            key={row.id}
            bg={selectedRows.includes(row.id) ? 'var(--mantine-color-gray-light)' : undefined}
        >
            {hasRowSelector &&
                <Table.Td>
                    <Checkbox
                        size="xs"
                        aria-label="Select row"
                        checked={selectedRows.includes(row.id)}
                        onChange={(event) =>
                            setSelectedRows(
                                event.currentTarget.checked
                                    ? [...selectedRows, row.id]
                                    : selectedRows.filter((id) => id !== row.id)
                            )
                        }
                    />
                </Table.Td>
            }
            {Object.values(row).map((col, key) => <Table.Td key={`${row.id}-${key}`}>{col}</Table.Td>)}
        </Table.Tr>
    ));

    const headers = data.headers.map((header, key) => {
        return <Table.Th key={`${key}-${header.name}`}>
            {header.sortable && <Sortable columnName={header.name} sort={sort!} handleSort={handleSort!} />}
            {header.name}
        </Table.Th>
    });


    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    {hasRowSelector && <Table.Th className={classes.checkboxHeader}>
                        <Checkbox
                            size="xs"
                            aria-label="Select all row"
                            checked={selectedRows.length === data.rows.length}
                            indeterminate={selectedRows.length > 0 && selectedRows.length < data.rows.length}
                            onChange={(event) =>
                                setSelectedRows(
                                    event.currentTarget.checked
                                        ? data.rows.map((row) => row.id)
                                        : []
                                )
                            }
                        />
                    </Table.Th>}
                    {headers}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    )
}

export default RichTable;