export const DEFAULT_PROFILE_COLOR = "#3B82F6";

export const SUGGESTED_PROFILE_COLORS = [
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#7C3AED",
    "#EC4899",
    "#F43F5E",
    "#DC2626",
    "#F97316",
    "#EAB308",
    "#84CC16",
    "#10B981",
    "#14B8A6",
    "#06B6D4",
] as const;

const LEGACY_COLOR_MAP: Record<string, string> = {
    ocean: "#3B82F6",
    violet: "#8B5CF6",
    sunset: "#F97316",
    emerald: "#10B981",
    rose: "#F43F5E",
};

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function normalizeProfileColor(value: string | null | undefined): string {
    if (!value) return DEFAULT_PROFILE_COLOR;
    if (LEGACY_COLOR_MAP[value]) return LEGACY_COLOR_MAP[value];
    const trimmed = value.trim();
    if (HEX_COLOR_PATTERN.test(trimmed)) return trimmed.toUpperCase();
    return DEFAULT_PROFILE_COLOR;
}

export function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function hexToRgb(hex: string) {
    const normalized = normalizeProfileColor(hex).slice(1);
    return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16),
    };
}

function shadeHex(hex: string, percent: number) {
    const { r, g, b } = hexToRgb(hex);
    const adjust = (channel: number) =>
        Math.min(255, Math.max(0, Math.round(channel + (255 * percent) / 100)));
    const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
    return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`.toUpperCase();
}

function getContrastText(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? "#1F2937" : "#FFFFFF";
}

export function getAvatarColorStyles(hex: string) {
    const color = normalizeProfileColor(hex);
    const contrast = getContrastText(color);
    return {
        background: `linear-gradient(135deg, ${shadeHex(color, 12)}, ${shadeHex(color, -18)})`,
        color: contrast,
        border: `4px solid ${color}`,
    };
}

export function isSameProfileColor(a: string, b: string) {
    return normalizeProfileColor(a) === normalizeProfileColor(b);
}
