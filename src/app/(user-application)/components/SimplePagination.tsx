'use client';

import Link from "next/link";
import { cn } from "utils/cn";
import { Button } from "./ui/button";

type Props = {
    currentPage: number;
    totalPages: number;
    basePath: string;
    searchParams?: Record<string, string>;
};

const linkClass =
    "inline-flex h-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 text-sm font-medium hover:bg-[var(--color-muted)]";

export default function SimplePagination({
    currentPage,
    totalPages,
    basePath,
    searchParams = {},
}: Props) {
    if (totalPages <= 1) return null;

    const makeHref = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(page));
        return `${basePath}?${params.toString()}`;
    };

    return (
        <div className="mt-4 flex items-center justify-between gap-2">
            {currentPage > 1 ? (
                <Link href={makeHref(currentPage - 1)} className={linkClass}>
                    Previous
                </Link>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    Previous
                </Button>
            )}
            <span className="text-sm text-[var(--color-muted-foreground)]">
                Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages ? (
                <Link href={makeHref(currentPage + 1)} className={cn(linkClass)}>
                    Next
                </Link>
            ) : (
                <Button variant="outline" size="sm" disabled>
                    Next
                </Button>
            )}
        </div>
    );
}
