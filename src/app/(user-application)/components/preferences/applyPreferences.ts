import { STORAGE_KEY, type Palette, type Theme, type UserPreferences } from "../../i18n";

const THEME_VARS = [
    "--color-background",
    "--color-foreground",
    "--color-card",
    "--color-card-foreground",
    "--color-nav",
    "--color-muted",
    "--color-muted-foreground",
    "--color-primary",
    "--color-primary-foreground",
    "--color-border",
    "--color-ring",
    "--color-accent",
] as const;

const LIGHT_CHROME = "#ffffff";
const DARK_CHROME = "#17212b";

const paletteTokens: Record<
    Palette,
    {
        light: { primary: string; accent: string; ring: string };
        dark: { primary: string; accent: string; ring: string };
    }
> = {
    ocean: {
        light: { primary: "hsl(211 90% 56%)", accent: "hsl(188 90% 40%)", ring: "hsl(211 90% 56%)" },
        dark: { primary: "hsl(217 91% 60%)", accent: "hsl(188 85% 46%)", ring: "hsl(217 91% 60%)" },
    },
    violet: {
        light: { primary: "hsl(256 88% 61%)", accent: "hsl(274 82% 60%)", ring: "hsl(256 88% 61%)" },
        dark: { primary: "hsl(259 94% 68%)", accent: "hsl(279 88% 70%)", ring: "hsl(259 94% 68%)" },
    },
    sunset: {
        light: { primary: "hsl(18 91% 57%)", accent: "hsl(42 94% 52%)", ring: "hsl(18 91% 57%)" },
        dark: { primary: "hsl(16 92% 58%)", accent: "hsl(39 94% 56%)", ring: "hsl(16 92% 58%)" },
    },
    emerald: {
        light: { primary: "hsl(160 84% 37%)", accent: "hsl(173 78% 39%)", ring: "hsl(160 84% 37%)" },
        dark: { primary: "hsl(160 84% 42%)", accent: "hsl(173 78% 43%)", ring: "hsl(160 84% 42%)" },
    },
    rose: {
        light: { primary: "hsl(337 82% 57%)", accent: "hsl(351 83% 61%)", ring: "hsl(337 82% 57%)" },
        dark: { primary: "hsl(337 83% 62%)", accent: "hsl(351 84% 66%)", ring: "hsl(337 83% 62%)" },
    },
};

function isInsideTelegramMiniApp() {
    return Boolean(typeof window !== "undefined" && window.Telegram?.WebApp?.initData);
}

export function applyPreferences(root: HTMLElement, prefs: UserPreferences) {
    // User settings always win for light/dark and palette.
    root.classList.remove("light", "dark");
    root.classList.add(prefs.theme);
    root.lang = prefs.locale;
    root.dir = prefs.locale === "fa" ? "rtl" : "ltr";
    root.dataset.locale = prefs.locale;
    root.dataset.theme = prefs.theme;
    root.dataset.palette = prefs.palette;

    THEME_VARS.forEach((name) => root.style.removeProperty(name));
    applyPalette(root, prefs.palette, prefs.theme);

    if (isInsideTelegramMiniApp()) {
        root.dataset.telegramTheme = "true";
        syncTelegramChrome(prefs.theme, root);
    } else {
        delete root.dataset.telegramTheme;
        // Outside Mini App the script may still exist; keep chrome in sync if present.
        syncTelegramChrome(prefs.theme, root);
    }
}

/**
 * Re-apply stored preferences after Telegram chrome events.
 * Does not pull colors from Telegram themeParams (those broke settings).
 */
export function applyCurrentTelegramTheme(root: HTMLElement) {
    if (!isInsideTelegramMiniApp()) return;

    const prefs = readStoredPreferences();
    if (prefs) {
        applyPreferences(root, prefs);
        return;
    }

    root.dataset.telegramTheme = "true";
    syncTelegramChrome((root.dataset.theme as Theme) || "dark", root);
}

function applyPalette(root: HTMLElement, palette: Palette, theme: Theme) {
    const token = paletteTokens[palette][theme];
    root.style.setProperty("--color-primary", token.primary);
    root.style.setProperty("--color-accent", token.accent);
    root.style.setProperty("--color-ring", token.ring);
}

function syncTelegramChrome(theme: Theme, root?: HTMLElement) {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;

    const fallback = theme === "light" ? LIGHT_CHROME : DARK_CHROME;
    let color = fallback;

    if (root) {
        const computed = getComputedStyle(root).getPropertyValue("--color-background").trim();
        if (computed) color = computed;
    }

    try {
        tg.setHeaderColor(color);
        tg.setBackgroundColor(color);
    } catch {
        // Older Telegram clients may not support these APIs.
    }
}

export function readStoredPreferences(): UserPreferences | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<UserPreferences>;
        if (parsed.locale !== "en" && parsed.locale !== "fa") return null;
        if (parsed.theme !== "light" && parsed.theme !== "dark") return null;
        const paletteValues = ["ocean", "violet", "sunset", "emerald", "rose"] as const;
        const palette = paletteValues.includes(parsed.palette as Palette)
            ? (parsed.palette as Palette)
            : "ocean";
        return { locale: parsed.locale, theme: parsed.theme, palette };
    } catch {
        return null;
    }
}
