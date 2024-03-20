import { Select } from "@mantine/core";
import { FC } from "react";
import classes from './RichTable.module.css';
import { IRichTablePageSizeProps } from "./interface";

const pageSizes = [
    '5', '10', '25', '50', '100', '200'
]
const PageSize: FC<IRichTablePageSizeProps> = ({ pageSize, handleChangePageSize }) => {

    return (
        <Select
            onChange={(value) => handleChangePageSize(Number(value))}
            className={classes.pageSize}
            size="xs"
            placeholder={String(pageSize)}
            data={pageSizes}
        />
    );
}

export default PageSize;