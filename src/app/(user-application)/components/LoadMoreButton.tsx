'use client';

import { Button } from "./ui/button";
import { useUserPreferences } from "./preferences/UserPreferencesProvider";
import { cn } from "utils/cn";

type Props = {
    hasMore: boolean;
    loading?: boolean;
    onClick: () => void;
    className?: string;
};

export default function LoadMoreButton({ hasMore, loading, onClick, className }: Props) {
    const { t } = useUserPreferences();

    if (!hasMore) return null;

    return (
        <Button
            type="button"
            variant="outline"
            className={cn("mt-2 w-full", className)}
            disabled={loading}
            onClick={onClick}
        >
            {loading ? t("common.loading") : t("common.loadMore")}
        </Button>
    );
}
