import { format } from "date-fns-jalali";
import dayjs from "dayjs";
import { GlobalConfigType } from "./types/configs";

export const formatDate = (date: Date, dateType: GlobalConfigType["dateType"], form?: string) => {
    if (!date) {
        return '';
    }
    if (dateType === "JALALI") {
        return format(date, form ?? "yyyy MMMM d");
    }
    return dayjs(date).format(form ?? 'YYYY MMM d');
}

export const getMonth = (date: Date, dateType: GlobalConfigType["dateType"]) => {
    if (dateType === "JALALI") {
        return format(date, "MMMM");
    }
    return dayjs(date).format("MMMM");
}