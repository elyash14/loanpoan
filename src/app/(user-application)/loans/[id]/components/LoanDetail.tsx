'use client';

import { useMemo, useRef, useState } from "react";
import LoanActions from "./LoanActions";
import LoanCharts from "./LoanCharts";
import LoanHero from "./LoanHero";
import LoanOverviewTab from "./LoanOverviewTab";
import LoanPaymentsTab from "./LoanPaymentsTab";
import LoanTimeline from "./LoanTimeline";
import type { LoanDetailData } from "./types";
import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";

export default function LoanDetail({ data }: { data: string }) {
    const { t } = useUserPreferences();
    const loan = useMemo(() => JSON.parse(data) as LoanDetailData, [data]);
    const [activeTab, setActiveTab] = useState<"overview" | "payments" | "events">("overview");
    const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid" | "overdue">("all");
    const tabsRef = useRef<HTMLDivElement | null>(null);

    const focusPaymentsTab = (filter: "paid" | "unpaid" | "overdue") => {
        setActiveTab("payments");
        setPaymentFilter(filter);
        tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="space-y-4">
            <LoanHero loan={loan} />
            <LoanActions loan={loan} />
            <LoanCharts loan={loan} onSelectFilter={focusPaymentsTab} />

            <div ref={tabsRef} className="space-y-3">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-1">
                    <div className="grid grid-cols-3 gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab("overview")}
                            className={
                                activeTab === "overview"
                                    ? "rounded-(--radius-lg) bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-(--shadow-soft)"
                                    : "rounded-(--radius-lg) px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            }
                        >
                            {t("loans.overview")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("payments")}
                            className={
                                activeTab === "payments"
                                    ? "rounded-(--radius-lg) bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-(--shadow-soft)"
                                    : "rounded-(--radius-lg) px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            }
                        >
                            {t("pages.payments")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("events")}
                            className={
                                activeTab === "events"
                                    ? "rounded-(--radius-lg) bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-(--shadow-soft)"
                                    : "rounded-(--radius-lg) px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            }
                        >
                            {t("loans.events")}
                        </button>
                    </div>
                </div>

                {activeTab === "overview" ? (
                    <LoanOverviewTab loan={loan} />
                ) : activeTab === "payments" ? (
                    <LoanPaymentsTab
                        loan={loan}
                        filter={paymentFilter}
                        onFilterChange={setPaymentFilter}
                    />
                ) : (
                    <LoanTimeline loan={loan} />
                )}
            </div>
        </div>
    );
}
