import { List, Text, ThemeIcon } from "@mantine/core";
import { IconCircleDashed } from "@tabler/icons-react";
import { ReactNode } from "react";
import classes from "./InfoList.module.css";


export type ListInfoType = {
    title: ReactNode,
    value: ReactNode
}

const InfoList = ({ listData }: { listData: ListInfoType[] }) => {
    return <List
        spacing="sm"
        center
        icon={
            <ThemeIcon size={18} radius="xl">
                <IconCircleDashed className={classes.listIcon} />
            </ThemeIcon>
        }
    >
        {listData.map((item, key) =>
            <List.Item key={key}>
                <Text className={classes.listTitle} span>{item.title}:&nbsp;</Text>
                {item.value}
            </List.Item>)}
    </List>
}

export default InfoList;