import PayAPaymentAction from "@dashboard/payments/components/PayAPaymentAction";
import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { Payment } from "@prisma/client";
import { IconCreditCardPay } from "@tabler/icons-react";


const PaymentsListAction = (row: Payment) => {

    if (row.payedAt) {
        return <Tooltip label="This payment has been paid">
            <ActionIcon
                size="sm"
                variant="light"
                disabled
                mr={rem(3)}>
                <IconCreditCardPay />
            </ActionIcon>
        </Tooltip>
    }

    return <PayAPaymentAction payment={row} />

}

export default PaymentsListAction