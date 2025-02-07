import { Box, Text } from "@mantine/core";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import classes from "./AccountInfo.module.css";

type props = {
    id: number
}

const AccountInstallments = ({ id }: props) => {

    return <Box className={classes.installmentsWrapper} ml="xs">
        <Box className={classes.installmentsCount}>
            <Text fw={700} span>Installments Paid So Far: </Text>
            <Text fz={30} fw={900} span>{123}</Text>
        </Box>
        <br />
        TODO: show 3 latest installments
        <br />
        if pass the due date show the pay action
        <Link href={`/${DASHBOARD_URL}/accounts/${id}/installments`}>View All Installments</Link>
    </Box>
}

export default AccountInstallments;