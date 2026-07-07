'use client';

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useUserPreferences } from "../../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../../components/preferences/useLocaleFormat";
import Money from "../../../components/preferences/Money";
import Link from "next/link";
import type { LoanDetailData } from "./types";

type Props = {
    loan: LoanDetailData;
};

function eventLabel(type: string, t: (key: string) => string) {
    if (type === "payment-paid") return t("accounts.activityPaymentPaid");
    if (type === "payment-overdue") return t("accounts.activityPaymentOverdue");
    return t("loans.activityPaymentUpcoming");
}

export default function LoanTimeline({ loan }: Props) {
    const { t } = useUserPreferences();
    const { formatDate } = useLocaleFormat();
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{t("loans.events")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {loan.timeline.length ? loan.timeline.map((event, index) => (
                        <Link
                            key={event.id}
                            href={event.href}
                            className="group grid grid-cols-[18px_1fr_auto] items-start gap-3 rounded-md px-1 py-2 hover:bg-muted/30"
                        >
                            <div className="relative mt-1 flex h-full justify-center">
                                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                {index < loan.timeline.length - 1 ? (
                                    <span className="absolute top-3 h-[calc(100%+8px)] w-px bg-border" />
                                ) : null}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium leading-5">{eventLabel(event.type, t)}</p>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    {formatDate(event.at, "YYYY-MM-DD HH:mm")}
                                </p>
                            </div>
                            <Money value={event.amount} className="pt-0.5 text-sm font-semibold" />
                        </Link>
                    )) : (
                        <p className="text-sm text-muted-foreground">{t("loans.noPaymentsYet")}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
