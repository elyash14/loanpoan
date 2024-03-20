import { Paper } from "@mantine/core";
import { FC, ReactNode } from "react";
import classes from './PagePaper.module.css';

const PagePaper: FC<{ children: ReactNode }> = ({ children }) => {
    return <Paper className={classes.pagePaper} shadow="sm" p="xl">
        {children}
    </Paper>
}

export default PagePaper;