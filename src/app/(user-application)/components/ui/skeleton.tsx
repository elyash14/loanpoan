import { cn } from "utils/cn";
import { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-[var(--radius-md)] bg-[var(--color-muted)]", className)}
            {...props}
        />
    );
}
