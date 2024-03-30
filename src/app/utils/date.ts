import { format } from "date-fns-jalali";
import dayjs from "dayjs";
import { GlobalConfigType } from "./types/configs";

export const formatDate = (date: Date, dateType: GlobalConfigType["dateType"], form: string = "yyyy MMMM d") => {
    if (dateType === "JALALI") {
        return format(date, form);
    }
    return dayjs(date).format(form);
}

export const getMonth = (date: Date, dateType: GlobalConfigType["dateType"]) => {
    if (dateType === "JALALI") {
        return format(date, "MMMM");
    }
    return dayjs(date).format("MMMM");
}