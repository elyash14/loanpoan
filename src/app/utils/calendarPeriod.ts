import { getYear as getJalaliYear, getMonth as getJalaliMonth } from "date-fns-jalali";

export type DateType = "JALALI" | "GREGORIAN";

export function getCalendarPeriod(date: Date, dateType: DateType) {
    if (dateType === "JALALI") {
        return {
            year: getJalaliYear(date),
            month: getJalaliMonth(date) + 1, // 1-12
        };
    } else {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1, // 1-12
        };
    }
}
