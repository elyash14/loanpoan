import { payAPayment } from "@database/pament/actions";
import { ActionIcon, Button, List, Modal, NumberFormatter, Text, ThemeIcon, Tooltip, rem, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Payment } from "@prisma/client";
import { IconAlertOctagonFilled, IconCircleDashed, IconCreditCardPay } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { errorNotification, successNotification } from "utils/Notification/notification";
import { formatDate } from "utils/date";
import { globalConfigAtom } from "utils/stores/configs";

type Props = {
    payment: Payment
}

const PayAPaymentAction = ({ payment }: Props) => {
    const { dateType, currency } = useAtomValue(globalConfigAtom);
    const theme = useMantineTheme();
    const [opened, { open, close }] = useDisclosure(false);

    const handleAction = async () => {
        const result = await payAPayment(payment.id);
        if (result.status === 'ERROR') {
            errorNotification({
                title: 'Error',
                message: result.message,
            });
        }
        else if (result.status === 'SUCCESS') {
            successNotification({
                title: 'Success',
                message: result.message,
            });
        }
        close();
    }

    return <>
        <Tooltip label="Pay this payment">
            <ActionIcon
                size="sm"
                variant="light"
                mr={rem(3)}
                onClick={open}
            >
                <IconCreditCardPay />
            </ActionIcon>
        </Tooltip>

        <Modal
            opened={opened}
            onClose={close}
            title={<Text fw="bold" display="flex" c="blue">Pay a Payment &nbsp;<IconAlertOctagonFilled /></Text>}
        >
            <List
                spacing="xs"
                size="sm"
                center
                icon={
                    <ThemeIcon size={24} radius="xl">
                        <IconCircleDashed style={{ width: rem(16), height: rem(16) }} />
                    </ThemeIcon>
                }
            >
                <List.Item><b><Text fw={700} span c={theme.primaryColor}>Account Info:</Text></b> {
                    `${(payment as any).loan?.account?.code} - ${(payment as any).loan?.account?.user?.fullName}`
                }</List.Item>
                <List.Item><Text fw={700} span c={theme.primaryColor}>Payable Amount:</Text> {
                    <NumberFormatter value={String(payment.amount)} thousandSeparator prefix={`${currency?.symbol} `} />
                }</List.Item>
                <List.Item><Text fw={700} span c={theme.primaryColor}>Due Date:</Text> {
                    formatDate(payment.dueDate!, dateType)
                }</List.Item>
            </List>
            <p>Are you sure to pay this payment?!</p>
            <Button mr={rem(5)} onClick={handleAction}>Confirm!</Button>
            <Button onClick={close} variant="default">Cancel</Button>
        </Modal>
    </>
}

export default PayAPaymentAction;