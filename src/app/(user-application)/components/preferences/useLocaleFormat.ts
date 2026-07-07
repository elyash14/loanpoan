'use client';

import dayjs from "dayjs";
import "dayjs/locale/fa";
import { useMemo } from "react";
import {
    formatMoney as formatMoneyBase,
    formatNumber as formatNumberBase,
    formatPercent as formatPercentBase,
    toLocaleDigits,
    type FormatLocale,
} from "utils/formatMoney";
import { useUserPreferences } from "./UserPreferencesProvider";

export function useLocaleFormat() {
    const { locale } = useUserPreferences();

    return useMemo(() => {
        const formatNumber = (value: string | number | null | undefined) =>
            formatNumberBase(value, locale as FormatLocale);
        const formatMoney = (value: string | number | null | undefined) =>
            formatMoneyBase(value, locale as FormatLocale);
        const formatPercent = (value: string | number | null | undefined) =>
            formatPercentBase(value, locale as FormatLocale);
        const formatDigits = (value: string | number) =>
            toLocaleDigits(value, locale as FormatLocale);
        const formatDate = (value: string | Date, format = "YYYY-MM-DD") =>
            toLocaleDigits(
                dayjs(value).locale(locale === "fa" ? "fa" : "en").format(format),
                locale as FormatLocale,
            );

        return {
            locale,
            formatNumber,
            formatMoney,
            formatPercent,
            formatDigits,
            formatDate,
        };
    }, [locale]);
}
