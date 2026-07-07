'use client';

import { useMemo } from "react";
import { formatJalaliDate } from "utils/formatJalaliDate";
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
        const formatLocale = locale as FormatLocale;
        const formatNumber = (value: string | number | null | undefined) =>
            formatNumberBase(value, formatLocale);
        const formatMoney = (value: string | number | null | undefined) =>
            formatMoneyBase(value, formatLocale);
        const formatPercent = (value: string | number | null | undefined) =>
            formatPercentBase(value, formatLocale);
        const formatDigits = (value: string | number) =>
            toLocaleDigits(value, formatLocale);
        const formatDate = (
            value: string | Date | null | undefined,
            format = "YYYY-MM-DD",
        ) => formatJalaliDate(value, format, formatLocale);

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
