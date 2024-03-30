import { addMonths } from "date-fns-jalali/addMonths";
import dayjs from "dayjs";
import Decimal from "decimal.js";
import { GlobalConfigType } from "utils/types/configs";

export type PaymentOnCalendar = { date: Date, amount: number };

export const calculateLoanPayments = (
    total: number,
    paymentCount: number,
    customAmount: number,
    start: Date,
    dateType: GlobalConfigType['dateType']
) => {
    if (customAmount > total) {
        return {
            payments: [],
            error: "Custom amount can't be greater than total amount!"
        }
    };

    let count = paymentCount;
    let amount = Decimal.div(total, count);
    if (customAmount !== 0) {
        count = Math.floor(total / customAmount);
        amount = new Decimal(customAmount);
    }

    if (count > 50) {
        return {
            payments: [],
            error: "Payment count must be less than 50"
        }
    }

    const payments: PaymentOnCalendar[] = [];

    // create amount based on count
    for (let i = 1; i <= count; i++) {
        const date = dateType === "JALALI" ? addMonths(start, i) : dayjs(start).add(1, 'M').toDate();
        payments.push({ date: date, amount: Number(amount.toDecimalPlaces(2)) });
    }
    // push the remain 
    if (count < paymentCount) {
        const remain = Decimal.sub(total, Decimal.mul(amount, count));
        const date = dateType === "JALALI" ? addMonths(start, count) : dayjs(start).add(1, 'M').toDate();
        payments.push({ date: date, amount: Number(remain) });
    }

    return {
        payments
    }
}

