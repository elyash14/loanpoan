import { CloseButton, Input } from "@mantine/core";
import { FC } from "react";
import { useDebouncedCallback } from "use-debounce";
import classes from './RichTable.module.css';
import { IRichTableSearchProps } from "./interface";

const Search: FC<IRichTableSearchProps> = ({ value, handleSearch }) => {
    const handleOnChange = useDebouncedCallback(
        (value) => {
            handleSearch(value)
        },
        500
    );

    return <Input
        defaultValue={value}
        className={classes.search}
        size="xs"
        placeholder="Search"
        onChange={(e) => handleOnChange(e.target.value)}
        rightSectionPointerEvents="all"
        rightSection={
            <CloseButton
                size="xs"
                aria-label="Clear search"
                onClick={() => handleSearch('')}
                style={{ display: value ? undefined : 'none' }}
            />
        }
    />;
}

export default Search;