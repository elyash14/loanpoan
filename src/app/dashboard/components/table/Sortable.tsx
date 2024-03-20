import { ActionIcon } from "@mantine/core";
import { IconArrowsSort, IconSortAscending2, IconSortDescending2 } from "@tabler/icons-react";
import { FC, useMemo } from "react";
import classes from './RichTable.module.css';
import { IRichTableSort } from "./interface";

interface IProps {
    columnName: string;
    sort: IRichTableSort
    handleSort: (sortable: IRichTableSort) => void
}
const Sortable: FC<IProps> = ({ columnName, sort, handleSort }) => {

    const handleClick = () => {
        handleSort({
            column: columnName,
            dir: (sort.dir === undefined || sort.dir === '+') ? '-' : '+'
        });
    }

    const icon = useMemo(() => {
        if (sort === undefined || columnName !== sort.column) {
            return <IconArrowsSort />
        }
        if (sort.dir === '-') {
            return <IconSortDescending2 />
        }
        return <IconSortAscending2 />
    }, [sort])

    return <ActionIcon className={classes.sortable}
        variant="subtle" size="sm"
        aria-label="Settings"
        onClick={handleClick}
    >
        {icon}
    </ActionIcon>
}

export default Sortable;