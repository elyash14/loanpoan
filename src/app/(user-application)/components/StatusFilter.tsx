'use client';

import { cn } from "utils/cn";
import Link from "next/link";

type Props = {
    options: { label: string; value: string }[];
    value: string;
    basePath: string;
};

export default function StatusFilter({ options, value, basePath }: Props) {
    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {options.map((opt) => (
                <Link
                    key={opt.value}
                    href={opt.value ? `${basePath}?status=${encodeURIComponent(opt.value)}` : basePath}
                    className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        value === opt.value
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                            : "border-[var(--color-border)] text-[var(--color-muted-foreground)]",
                    )}
                >
                    {opt.label}
                </Link>
            ))}
        </div>
    );
}
