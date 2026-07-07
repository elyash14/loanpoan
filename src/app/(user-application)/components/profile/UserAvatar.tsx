'use client';

import { cn } from "utils/cn";
import {
    getAvatarColorStyles,
    initialsFromName,
    normalizeProfileColor,
} from "./profileColors";

type Props = {
    name: string;
    avatar?: string | null;
    profileColor?: string | null;
    size?: "md" | "lg";
    className?: string;
};

const sizeClasses = {
    md: "h-14 w-14 text-base",
    lg: "h-20 w-20 text-xl",
};

export default function UserAvatar({ name, avatar, profileColor, size = "lg", className }: Props) {
    const color = normalizeProfileColor(profileColor);
    const avatarStyles = getAvatarColorStyles(color);
    const initials = initialsFromName(name);

    if (avatar) {
        return (
            <span
                className={cn(
                    "relative inline-flex shrink-0 overflow-hidden rounded-full box-border",
                    sizeClasses[size],
                    className,
                )}
                style={{ border: avatarStyles.border }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
            </span>
        );
    }

    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full font-bold box-border",
                sizeClasses[size],
                className,
            )}
            style={avatarStyles}
        >
            {initials}
        </span>
    );
}
