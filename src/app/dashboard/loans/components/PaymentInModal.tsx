import { Card, NumberFormatter, Text, rem, useMantineTheme } from "@mantine/core";
import { formatDate, getMonth } from "utils/date";
import { PaymentOnCalendar } from "utils/loan/calculatePayment";
import { GlobalConfigType } from "utils/types/configs";

const PaymentInModal = ({ payment, dateType, currency }: {
    payment: PaymentOnCalendar, dateType: GlobalConfigType["dateType"], currency: GlobalConfigType["currency"]
}) => {
    const theme = useMantineTheme();
    return <Card shadow="md" padding="xs" radius="xs" maw={rem(150)} style={{ margin: "auto" }}>
        <Card.Section ta="center">
            <Text mt="md" c={theme.primaryColor} fz={rem(25)} fw="bold">{getMonth(payment.date, dateType)}</Text>
            <Text mb="xs" size="sm" c={theme.colors.gray[6]}>{formatDate(payment.date, dateType, 'y-M-d')}</Text>
        </Card.Section>
        <Card.Section mb="xs" ta="center">
            <Text c={theme.colors.gray[1]}>
                <NumberFormatter value={payment.amount} thousandSeparator prefix={`${currency?.symbol} `} />
            </Text>
        </Card.Section>
    </Card>
}

export default PaymentInModal;