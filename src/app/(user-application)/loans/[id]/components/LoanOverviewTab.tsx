'use client';

import { Card, CardContent } from "../../../components/ui/card";
import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";
import { cn } from "utils/cn";
import type { LoanDetailData } from "./types";

type Props = {
    loan: LoanDetailData;
};

type PaymentStatus = "paid" | "unpaid" | "overdue";

function normalizeDigits(value: string) {
    return value
        .replaceAll("۰", "0")
        .replaceAll("۱", "1")
        .replaceAll("۲", "2")
        .replaceAll("۳", "3")
        .replaceAll("۴", "4")
        .replaceAll("۵", "5")
        .replaceAll("۶", "6")
        .replaceAll("۷", "7")
        .replaceAll("۸", "8")
        .replaceAll("۹", "9");
}

function getPersianYearMonth(date: Date) {
    const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "numeric",
    }).format(date);
    const [rawYear, rawMonth] = normalizeDigits(formatted).split("/");
    return { year: Number(rawYear), month: Number(rawMonth) };
}

function getSeason(month: number) {
    if (month <= 3) return "spring" as const;
    if (month <= 6) return "summer" as const;
    if (month <= 9) return "autumn" as const;
    return "winter" as const;
}

export default function LoanOverviewTab({ loan }: Props) {
    const { t, locale } = useUserPreferences();
    const now = new Date();
    const seasonLabels = {
        spring: t("loans.seasonSpring"),
        summer: t("loans.seasonSummer"),
        autumn: t("loans.seasonAutumn"),
        winter: t("loans.seasonWinter"),
    } as const;
    const monthFormatter = new Intl.DateTimeFormat(
        locale === "fa" ? "fa-IR-u-ca-persian" : "en-US-u-ca-persian",
        { month: "long" },
    );

    const paymentsWithSeason = loan.payments.map((payment) => {
        const dueDate = new Date(payment.dueDate);
        const { year, month } = getPersianYearMonth(dueDate);
        const season = getSeason(month);
        const rawMonth = monthFormatter.format(dueDate).replace(/\./g, "").trim();
        const status: PaymentStatus = payment.paidAt
            ? "paid"
            : dueDate < now
                ? "overdue"
                : "unpaid";
        return { ...payment, season, year, dueDate, status, rawMonth };
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
        if (status === "paid") return "border-emerald-500 bg-card text-emerald-600";
        if (status === "overdue") return "border-rose-500 bg-card text-rose-600";
        return "border-sky-500 bg-card text-sky-600";
    };

    return (
        <Card>
            <CardContent className="overflow-hidden px-6 py-8">
                <div className="flex flex-col">
                    {grouped.length ? grouped.map((group, index) => {
                        const isEvenRow = index % 2 === 0;
                        const directionItems = isEvenRow ? group.items : [...group.items].reverse();
                        const singleItemAlign = isEvenRow ? "justify-start" : "justify-end";

                        return (
                            <div key={`${group.year}-${group.season}`} className="relative h-24">
                                {/* Season Title */}
                                <div className="absolute inset-x-0 top-0 flex justify-center">
                                    <span className="text-[13px] font-bold text-muted-foreground/70">
                                        {seasonLabels[group.season]} {group.year}
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
                                        "absolute inset-x-10 top-1/2 flex -translate-y-1/2 items-center",
                                        directionItems.length > 1 ? "justify-between" : singleItemAlign,
                                    )}
                                >
                                    {directionItems.map((item) => (
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
                                    ))}
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
