'use client';

import { cn } from "utils/cn";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
};

export default function BottomDrawer({
    open,
    onClose,
    title,
    description,
    children,
    className,
}: Props) {
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-70 flex items-end justify-center">
            <button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="bottom-drawer-title"
                className={cn(
                    "relative w-full max-w-lg rounded-t-3xl border border-border/70 bg-card shadow-(--shadow-nav)",
                    "max-h-[min(85dvh,720px)] overflow-y-auto",
                    "pb-[max(1rem,env(safe-area-inset-bottom))]",
                    className,
                )}
            >
                <div className="sticky top-0 z-10 bg-card/95 px-4 pb-3 pt-3 backdrop-blur-sm">
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 id="bottom-drawer-title" className="text-base font-semibold">
                                {title}
                            </h3>
                            {description ? (
                                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="px-4 pb-4">{children}</div>
            </div>
        </div>
    );
}
