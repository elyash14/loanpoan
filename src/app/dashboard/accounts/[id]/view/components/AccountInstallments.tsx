import PayAnInstallmentAction from "@dashboard/installments/components/PayAnInstallmentAction";
import { Box, NumberFormatter, Table, Text } from "@mantine/core";
import { Installment } from "@prisma/client";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { DASHBOARD_URL } from "utils/configs";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";
import classes from "./AccountInfo.module.css";
type props = {
    id: number,
    installmentsCount: number,
    latestInstallments: Installment[],
}

const AccountInstallments = ({ id, installmentsCount, latestInstallments }: props) => {
    const { dateType, currency } = useAtomValue(globalConfigAtom);

    return <Box className={classes.installmentsWrapper} ml="xs">
        <Box className={classes.installmentsCount}>
            <Text fw={700} span>Installments Paid So Far: </Text>
            <Text fz={30} fw={900} span>{installmentsCount}</Text>
        </Box>

        <Box mt="md" w="100%">
            <Text fw={600} mb="xs">Latest Installments:</Text>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Amount</Table.Th>
                        <Table.Th>Due Date</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {latestInstallments.map((installment) => (
                        <Table.Tr key={installment.id}>
                            <Table.Td>
                                <NumberFormatter value={Number(installment.amount)} thousandSeparator prefix={`${currency?.symbol} `} />
                            </Table.Td>
                            <Table.Td>{formatDate(installment.dueDate, dateType!)}</Table.Td>
                            <Table.Td>{installment.payedAt ? "Paid" : (
                                <PayAnInstallmentAction installment={installment} />
                            )}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Box>

        <Box mt="md" ta="end" w="100%">
            <Link href={`/${DASHBOARD_URL}/accounts/${id}/installments`}>View All Installments</Link>
        </Box>
    </Box>
}

export default AccountInstallments;