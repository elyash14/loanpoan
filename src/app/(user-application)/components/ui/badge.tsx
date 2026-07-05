import { cn } from "utils/cn";
import { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "secondary" | "destructive" | "outline";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                variant === "default" && "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
                variant === "secondary" && "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
                variant === "destructive" && "bg-[var(--color-destructive)] text-white",
                variant === "outline" && "border border-[var(--color-border)]",
                className,
            )}
            {...props}
        />
    );
}
