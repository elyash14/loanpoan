
import { payAnInstallment } from "@database/installments/actions";
import { ActionIcon, Button, List, Modal, NumberFormatter, rem, Text, ThemeIcon, Tooltip, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Installment } from "@prisma/client";
import { IconAlertOctagonFilled, IconCircleDashed, IconIdBadge2 } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { formatDate } from "utils/date";
import { errorNotification, successNotification } from "utils/Notification/notification";
import { globalConfigAtom } from "utils/stores/configs";

type Props = {
    installment: Installment,
}

const PayAnInstallmentAction = ({ installment }: Props) => {
    const { dateType, currency } = useAtomValue(globalConfigAtom);
    const theme = useMantineTheme();
    const [opened, { open, close }] = useDisclosure(false);

    const handleAction = async () => {
        const result = await payAnInstallment(installment.id);
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

    if (installment.payedAt) {
        return <ActionIcon
            size="sm"
            disabled
            variant="light"
            mr={rem(3)}>
            <IconIdBadge2 />
        </ActionIcon>
    }

    return <>
        <Tooltip label="Pay this installment">
            <ActionIcon
                size="sm"
                variant="light"
                mr={rem(3)}
                onClick={open}
            >
                <IconIdBadge2 />
            </ActionIcon>
        </Tooltip>
        <Modal
            opened={opened}
            onClose={close}
            title={<Text fw="bold" display="flex" c="blue">Pay an Installment &nbsp;<IconAlertOctagonFilled /></Text>}
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
                {(installment as any).loan &&
                    <List.Item><b><Text fw={700} span c={theme.primaryColor}>Installment Info:</Text></b> {
                        `${(installment as any).loan?.code} - ${(installment as any).loan?.user?.fullName}`
                    }</List.Item>}
                <List.Item><Text fw={700} span c={theme.primaryColor}>Payable Amount:</Text> {
                    <NumberFormatter value={String(installment.amount)} thousandSeparator prefix={`${currency?.symbol} `} />
                }</List.Item>
                <List.Item><Text fw={700} span c={theme.primaryColor}>Due Date:</Text> {
                    formatDate(installment.dueDate!, dateType)
                }</List.Item>
            </List>
            <p>Are you sure to pay this installment?!</p>
            <Button mr={rem(5)} onClick={handleAction}>Confirm!</Button>
            <Button onClick={close} variant="default">Cancel</Button>
        </Modal>
    </>
}

export default PayAnInstallmentAction;