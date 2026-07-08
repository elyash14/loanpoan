'use client';

import { cn } from "utils/cn";

export type SegmentedTab<T extends string> = {
    id: T;
    label: string;
    badge?: boolean;
};

type Props<T extends string> = {
    tabs: SegmentedTab<T>[];
    activeTab: T;
    onChange: (tab: T) => void;
    className?: string;
};

export default function SegmentedTabs<T extends string>({
    tabs,
    activeTab,
    onChange,
    className,
}: Props<T>) {
    return (
        <div className={cn("rounded-xl border border-border/70 bg-muted/20 p-1", className)}>
            <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "relative rounded-(--radius-lg) px-2 py-1.5 text-sm transition-colors",
                            activeTab === tab.id
                                ? "bg-primary font-semibold text-primary-foreground shadow-(--shadow-soft)"
                                : "font-medium text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <span className="truncate">{tab.label}</span>
                        {tab.badge ? (
                            <span
                                aria-hidden
                                className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive"
                            />
                        ) : null}
                    </button>
                ))}
            </div>
        </div>
    );
}
