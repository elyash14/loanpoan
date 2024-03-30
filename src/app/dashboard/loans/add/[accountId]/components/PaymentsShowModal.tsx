import PaymentInModal from "@dashboard/loans/components/PaymentInModal";
import { Alert, Button, Divider, Grid, Modal, NumberInput, ScrollArea, rem } from "@mantine/core";
import { IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { calculateLoanPayments } from "utils/loan/calculatePayment";
import { GlobalConfigType } from "utils/types/configs";

type Props = {
    totalAmount: number,
    paymentCount: number,
    startedAt: Date,
    dateType: GlobalConfigType['dateType'],
    currency: GlobalConfigType['currency'],
    handleClose: (paymentAmount: number, paymentCount: number) => void,
}
const PaymentsShowModal = (props: Props) => {
    const { totalAmount, paymentCount, startedAt, dateType, currency, handleClose } = props;
    const [customAmount, setCustomAmount] = useState<number>(0);
    const [customAmountValue] = useDebounce(customAmount, 1000);

    const { payments, error } = useMemo(
        () => calculateLoanPayments(totalAmount, paymentCount, customAmountValue, startedAt, dateType),
        [totalAmount, paymentCount, startedAt, dateType, customAmountValue]
    );

    return <Modal
        opened={true}
        size="lg"
        onClose={() => handleClose(payments[0].amount ?? 0, payments.length ?? paymentCount)} title="All Payments"
        display="flex"
    >
        <ScrollArea mih={100} h={350} >
            {error && <Alert mb={rem(10)} variant="light" color="pink" title="Caution" icon={<IconInfoCircle />}>
                {error}
            </Alert>}
            <Grid>
                {payments.map((payment, key) =>
                    <Grid.Col key={key} span={4}>
                        <PaymentInModal payment={payment} dateType={dateType} currency={currency} />
                    </Grid.Col>)}
            </Grid>
        </ScrollArea>
        <Divider my="md" />
        <NumberInput
            mb={rem(0)}
            label="Custom Amount Per Month"
            value={customAmount}
            thousandSeparator=","
            onChange={(v) => setCustomAmount(Number(v))}
            allowNegative={false}
        />
        <Button
            ml={rem(5)}
            mt={rem(20)}
            rightSection={<IconCheck size={14} />}
            onClick={() => handleClose(payments[0].amount ?? 0, payments.length ?? paymentCount)}>
            OK
        </Button>
    </Modal>
}

export default PaymentsShowModal;