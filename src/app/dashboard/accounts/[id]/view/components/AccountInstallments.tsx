import { Box, Text } from "@mantine/core";
import classes from "./AccountInfo.module.css";

const AccountInstallments = () => {

    return <Box className={classes.installmentsWrapper} ml="xs">
        <Box className={classes.installmentsCount}>
            <Text fw={700} span>Installments Paid So Far: </Text>
            <Text fz={30} fw={900} span>{123}</Text>
        </Box>
        <br />
        TODO: show 3 latest installments
        <br />
        if pass the due date show the pay action
    </Box>
}

export default AccountInstallments;