import { cn } from "utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg";
};

const variants = {
    default: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90",
    outline: "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-muted)]",
    ghost: "hover:bg-[var(--color-muted)]",
    destructive: "bg-[var(--color-destructive)] text-white hover:opacity-90",
};

const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-11 px-6",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-[var(--radius-md)] text-sm font-medium transition-opacity disabled:opacity-50",
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        />
    ),
);
Button.displayName = "Button";
