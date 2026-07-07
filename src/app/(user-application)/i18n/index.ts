import { en, type Messages } from "./locales/en";
import { fa } from "./locales/fa";

export type Locale = "en" | "fa";
export type Theme = "light" | "dark";
export type Palette = "ocean" | "violet" | "sunset" | "emerald" | "rose";
export type MessageKey = string;

const dictionaries: Record<Locale, Messages> = { en, fa };

export function getMessages(locale: Locale): Messages {
    return dictionaries[locale] ?? en;
}

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
    const value = path.split(".").reduce<unknown>((acc, part) => {
        if (acc && typeof acc === "object" && part in acc) {
            return (acc as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
    return typeof value === "string" ? value : undefined;
}

export function createTranslator(locale: Locale) {
    const messages = getMessages(locale);

    return function t(key: MessageKey, params?: Record<string, string | number>): string {
        const template = getByPath(messages as unknown as Record<string, unknown>, key) ?? key;
        if (!params) return template;
        return Object.entries(params).reduce(
            (text, [param, value]) => text.replaceAll(`{${param}}`, String(value)),
            template,
        );
    };
}

export const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    fa: "فارسی",
};

export const STORAGE_KEY = "user-panel-preferences";

export type UserPreferences = {
    locale: Locale;
    theme: Theme;
    palette: Palette;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
    locale: "fa",
    theme: "dark",
    palette: "ocean",
};
