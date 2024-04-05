import { CloseButton, Input } from "@mantine/core";
import { FC, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import classes from "./RichTable.module.css";
import { IRichTableSearchProps } from "./interface";

const Search: FC<IRichTableSearchProps> = ({ value, handleSearch }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOnChange = useDebouncedCallback(
    (value) => handleSearch(value),
    500,
  );

  return (
    <Input
      defaultValue={value}
      className={classes.search}
      size="xs"
      ref={inputRef}
      placeholder="Search"
      onChange={(e) => handleOnChange(e.target.value)}
      rightSectionPointerEvents="all"
      rightSection={
        <CloseButton
          size="xs"
          aria-label="Clear search"
          onClick={() => {
            handleSearch("");
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }}
          style={{ display: value ? undefined : "none" }}
        />
      }
    />
  );
};

export default Search;
