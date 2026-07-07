'use client';

import { cn } from "utils/cn";
import { getCurrencyLabel } from "utils/formatMoney";
import { useUserPreferences } from "./UserPreferencesProvider";
import { useLocaleFormat } from "./useLocaleFormat";

type Props = {
    value: string | number | null | undefined;
    className?: string;
    unitClassName?: string;
};

export default function Money({ value, className, unitClassName }: Props) {
    const { locale } = useUserPreferences();
    const { formatNumber } = useLocaleFormat();

    return (
        <span className={cn("tabular-nums", className)}>
            {formatNumber(value)}
            <span
                className={cn(
                    "ms-1 align-baseline text-[0.62em] font-medium leading-none opacity-75",
                    unitClassName,
                )}
            >
                {getCurrencyLabel(locale)}
            </span>
        </span>
    );
}
