'use client';

import StatusFilter from "./StatusFilter";
import { useUserPreferences } from "./preferences/UserPreferencesProvider";

type Props = {
    value: string;
    basePath: string;
    variant: "loans" | "installments" | "payments";
};

export default function TranslatedStatusFilter({ value, basePath, variant }: Props) {
    const { t } = useUserPreferences();

    const optionsByVariant = {
        loans: [
            { label: t("status.all"), value: "" },
            { label: t("status.inProgress"), value: "IN_PROGRESS" },
            { label: t("status.finished"), value: "FINISHED" },
            { label: t("status.overdue"), value: "Overdue" },
        ],
        installments: [
            { label: t("status.all"), value: "" },
            { label: t("status.unpaid"), value: "Not Paid" },
            { label: t("status.paid"), value: "Paid" },
            { label: t("status.overdue"), value: "Overdue" },
        ],
        payments: [
            { label: t("status.all"), value: "" },
            { label: t("status.unpaid"), value: "Not Paid" },
            { label: t("status.paid"), value: "Paid" },
            { label: t("status.overdue"), value: "Overdue" },
        ],
    };

    return (
        <StatusFilter
            options={optionsByVariant[variant]}
            value={value}
            basePath={basePath}
        />
    );
}
