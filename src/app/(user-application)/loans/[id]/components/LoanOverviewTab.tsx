'use client';

import { cn } from "utils/cn";
import { formatJalaliDate, getJalaliYearMonth } from "utils/formatJalaliDate";
import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../../components/preferences/useLocaleFormat";
import { Card, CardContent } from "../../../components/ui/card";
import type { LoanDetailData } from "./types";

type Props = {
    loan: LoanDetailData;
};

type PaymentStatus = "paid" | "unpaid" | "overdue";

function getSeason(month: number) {
    if (month <= 3) return "spring" as const;
    if (month <= 6) return "summer" as const;
    if (month <= 9) return "autumn" as const;
    return "winter" as const;
}

export default function LoanOverviewTab({ loan }: Props) {
    const { t, locale } = useUserPreferences();
    const { formatNumber } = useLocaleFormat();
    const now = new Date();
    const seasonLabels = {
        spring: t("loans.seasonSpring"),
        summer: t("loans.seasonSummer"),
        autumn: t("loans.seasonAutumn"),
        winter: t("loans.seasonWinter"),
    } as const;

    const paymentsWithSeason = loan.payments.map((payment) => {
        const dueDate = new Date(payment.dueDate);
        const { year, month } = getJalaliYearMonth(dueDate);
        const season = getSeason(month);
        const rawMonth = formatJalaliDate(dueDate, "MMMM", locale);
        const status: PaymentStatus = payment.paidAt
            ? "paid"
            : dueDate < now
                ? "overdue"
                : "unpaid";
        return { ...payment, season, year, month, dueDate, status, rawMonth };
    });

    const seasonMap = new Map<string, { year: number; season: keyof typeof seasonLabels; items: typeof paymentsWithSeason }>();
    for (const payment of paymentsWithSeason) {
        const key = `${payment.year}-${payment.season}`;
        const existing = seasonMap.get(key);
        if (existing) {
            existing.items.push(payment);
        } else {
            seasonMap.set(key, {
                year: payment.year,
                season: payment.season,
                items: [payment],
            });
        }
    }

    const grouped = Array.from(seasonMap.values())
        .sort((a, b) => {
            const seasonOrder = { spring: 1, summer: 2, autumn: 3, winter: 4 } as const;
            if (a.year !== b.year) return b.year - a.year;
            return seasonOrder[b.season] - seasonOrder[a.season];
        })
        .slice(0, 6);

    const itemClass = (status: PaymentStatus) => {
        if (status === "paid") return "border-emerald-500 text-emerald-600 bg-muted shadow-lg shadow-emerald-500/20";
        if (status === "overdue") return "border-rose-500 text-rose-600 bg-muted shadow-lg shadow-rose-500/20";
        return "border-sky-500 text-sky-600 bg-muted shadow-lg shadow-sky-500/20";
    };

    return (
        <Card>
            <CardContent className="overflow-hidden px-6 py-8">
                <div className="flex flex-col">
                    {grouped.length ? grouped.map((group, index) => {
                        const isEvenRow = index % 2 === 0;

                        // Create slots for the 3 months of the season
                        const slots = [null, null, null] as (typeof group.items[number] | null)[];
                        for (const item of group.items) {
                            const offset = (item.month - 1) % 3;
                            slots[offset] = item;
                        }

                        // Order slots depending on even/odd row direction and LTR/RTL layout
                        const isRtl = locale === "fa";
                        let directionItems;

                        if (isRtl) {
                            // In RTL, DOM order [A, B, C] renders physically as Right: A, Center: B, Left: C
                            directionItems = isEvenRow
                                ? [slots[0], slots[1], slots[2]]
                                : [slots[2], slots[1], slots[0]];
                        } else {
                            // In LTR, DOM order [A, B, C] renders physically as Left: A, Center: B, Right: C
                            directionItems = isEvenRow
                                ? [slots[2], slots[1], slots[0]]
                                : [slots[0], slots[1], slots[2]];
                        }

                        return (
                            <div key={`${group.year}-${group.season}`} className="relative h-24">
                                {/* Season Title */}
                                <div className="absolute inset-x-0 top-0 flex justify-center">
                                    <span className="text-[13px] font-bold text-muted-foreground/70">
                                        {seasonLabels[group.season]} {formatNumber(group.year)}
                                    </span>
                                </div>

                                {/* Main horizontal dashed line */}
                                <div className="absolute inset-x-12 top-1/2 h-0 -translate-y-1/2 border-t-[3px] border-dashed border-muted-foreground/30" />

                                {/* Start cap */}
                                {index === 0 && (
                                    <div className="absolute left-4 top-1/2 h-0 w-8 -translate-y-1/2 border-t-[3px] border-dashed border-muted-foreground/30" />
                                )}

                                {/* End cap */}
                                {index === grouped.length - 1 && (
                                    <div
                                        className={cn(
                                            "absolute top-1/2 h-0 w-8 -translate-y-1/2 border-t-[3px] border-dashed border-muted-foreground/30",
                                            isEvenRow ? "right-4" : "left-4",
                                        )}
                                    />
                                )}

                                {/* U-Turn connecting to next row */}
                                {index < grouped.length - 1 && (
                                    <div
                                        className={cn(
                                            "absolute top-1/2 h-24 w-12 border-y-[3px] border-dashed border-muted-foreground/30",
                                            isEvenRow
                                                ? "right-0 rounded-r-[56px] border-r-[3px]"
                                                : "left-0 rounded-l-[56px] border-l-[3px]",
                                        )}
                                    />
                                )}

                                {/* Nodes container */}
                                <div
                                    className={cn(
                                        "absolute inset-x-10 top-1/2 flex -translate-y-1/2 items-center justify-between",
                                    )}
                                >
                                    {directionItems.map((item, itemIdx) => {
                                        if (!item) {
                                            return (
                                                <div
                                                    key={`empty-${itemIdx}`}
                                                    className="w-[52px] h-[52px] invisible"
                                                />
                                            );
                                        }
                                        return (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "flex h-[52px] w-[52px] items-center justify-center rounded-full border-[3px]",
                                                    itemClass(item.status),
                                                )}
                                                title={item.rawMonth}
                                            >
                                                <span className="text-[11px] font-bold tracking-tight">
                                                    {item.rawMonth}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="px-6 text-sm text-muted-foreground">{t("loans.noPaymentsYet")}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
