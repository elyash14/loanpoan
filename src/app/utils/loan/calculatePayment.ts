import Decimal from "decimal.js";
import { GlobalConfigType } from "utils/types/configs";
import {
    addCalendarMonths,
    setDayOfMonth,
} from "utils/installmentTiming";

export type PaymentOnCalendar = { date: Date, amount: number };

export const calculateLoanPayments = (
    total: number,
    paymentCount: number,
    customAmount: number,
    start: Date,
    dateType: GlobalConfigType['dateType'],
    payDay = 5,
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

    const calendar = dateType ?? "JALALI";
    const deadlineDay = payDay;

    const payments: PaymentOnCalendar[] = [];

    // create amount based on count — snap each date to payment deadline day
    for (let i = 1; i <= count; i++) {
        const monthAnchor = addCalendarMonths(start, i, calendar);
        const date = setDayOfMonth(monthAnchor, deadlineDay, calendar);
        payments.push({ date, amount: Number(amount.toDecimalPlaces(2)) });
    }
    // if the remain is greater than 0, then add the remain to the last payment
    if (Decimal.sub(total, Decimal.mul(amount, count)).toNumber() > 0) {
        if (count == paymentCount) {
            payments[payments.length - 1].amount = Number(Decimal.add(payments[payments.length - 1].amount, Decimal.sub(total, Decimal.mul(amount, count))));
        }
    }
    // push the remain 
    if (count < paymentCount) {
        const remain = Decimal.sub(total, Decimal.mul(amount, count));
        const monthAnchor = addCalendarMonths(start, count + 1, calendar);
        const date = setDayOfMonth(monthAnchor, deadlineDay, calendar);
        payments.push({ date, amount: Number(remain) });
    }

    return {
        payments
    }
}
