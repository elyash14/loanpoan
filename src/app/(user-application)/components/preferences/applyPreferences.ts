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

export function applyPreferences(root: HTMLElement, prefs: UserPreferences) {
    const telegram = window.Telegram?.WebApp;
    const resolvedTheme = telegram?.initData && telegram.colorScheme
        ? telegram.colorScheme
        : prefs.theme;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.lang = prefs.locale;
    root.dir = prefs.locale === "fa" ? "rtl" : "ltr";
    root.dataset.locale = prefs.locale;
    root.dataset.theme = resolvedTheme;
    root.dataset.palette = prefs.palette;

    THEME_VARS.forEach((name) => root.style.removeProperty(name));

    if (telegram?.initData) {
        root.dataset.telegramTheme = "true";
        applyTelegramTheme(root, telegram);
    } else {
        delete root.dataset.telegramTheme;
        applyPalette(root, prefs.palette, prefs.theme);
        syncTelegramChrome(prefs.theme);
    }
}

export function applyCurrentTelegramTheme(root: HTMLElement) {
    const telegram = window.Telegram?.WebApp;
    if (!telegram?.initData) return;

    root.classList.remove("light", "dark");
    root.classList.add(telegram.colorScheme ?? "dark");
    root.dataset.theme = telegram.colorScheme ?? "dark";
    root.dataset.telegramTheme = "true";
    THEME_VARS.forEach((name) => root.style.removeProperty(name));
    applyTelegramTheme(root, telegram);
}

function applyTelegramTheme(
    root: HTMLElement,
    telegram: NonNullable<Window["Telegram"]>["WebApp"],
) {
    const params = telegram.themeParams;
    const background = params.bg_color;
    const secondary = params.secondary_bg_color ?? background;
    const foreground = params.text_color;
    const hint = params.hint_color;
    const primary = params.button_color ?? params.link_color;
    const primaryForeground = params.button_text_color;

    if (background) root.style.setProperty("--color-background", background);
    if (secondary) {
        root.style.setProperty("--color-card", secondary);
        root.style.setProperty("--color-nav", secondary);
        root.style.setProperty("--color-muted", `color-mix(in srgb, ${secondary} 82%, ${foreground ?? "#ffffff"})`);
    }
    if (foreground) {
        root.style.setProperty("--color-foreground", foreground);
        root.style.setProperty("--color-card-foreground", foreground);
        root.style.setProperty("--color-border", `color-mix(in srgb, ${foreground} 13%, transparent)`);
    }
    if (hint) root.style.setProperty("--color-muted-foreground", hint);
    if (primary) {
        root.style.setProperty("--color-primary", primary);
        root.style.setProperty("--color-ring", primary);
    }
    if (primaryForeground) {
        root.style.setProperty("--color-primary-foreground", primaryForeground);
    }

    telegram.setHeaderColor(background ?? (telegram.colorScheme === "light" ? LIGHT_CHROME : DARK_CHROME));
    telegram.setBackgroundColor(background ?? (telegram.colorScheme === "light" ? LIGHT_CHROME : DARK_CHROME));
}

function applyPalette(root: HTMLElement, palette: Palette, theme: Theme) {
    const token = paletteTokens[palette][theme];
    root.style.setProperty("--color-primary", token.primary);
    root.style.setProperty("--color-accent", token.accent);
    root.style.setProperty("--color-ring", token.ring);
}

function syncTelegramChrome(theme: Theme) {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const color = theme === "light" ? LIGHT_CHROME : DARK_CHROME;
    tg.setHeaderColor(color);
    tg.setBackgroundColor(color);
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
