'use client';

import {
    createTranslator,
    DEFAULT_PREFERENCES,
    STORAGE_KEY,
    type Locale,
    type Palette,
    type Theme,
    type UserPreferences,
} from "../../i18n";
import {
    applyPreferences,
    readStoredPreferences,
} from "./applyPreferences";
import { updateUserPreferences } from "@database/user-panel/actions";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type UserPreferencesContextValue = {
    locale: Locale;
    theme: Theme;
    palette: Palette;
    setLocale: (locale: Locale) => void;
    setTheme: (theme: Theme) => void;
    setPalette: (palette: Palette) => void;
    t: ReturnType<typeof createTranslator>;
    ready: boolean;
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null);

const PALETTES: Palette[] = ["ocean", "violet", "sunset", "emerald", "rose"];

function persist(prefs: UserPreferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function normalizePreferences(raw: unknown): UserPreferences | null {
    if (!raw || typeof raw !== "object") return null;
    const value = raw as Partial<UserPreferences>;
    if (value.locale !== "en" && value.locale !== "fa") return null;
    if (value.theme !== "light" && value.theme !== "dark") return null;
    const palette = PALETTES.includes(value.palette as Palette)
        ? (value.palette as Palette)
        : "ocean";
    return { locale: value.locale, theme: value.theme, palette };
}

export default function UserPreferencesProvider({
    children,
    dbPreferences,
}: {
    children: ReactNode;
    dbPreferences?: UserPreferences | null;
}) {
    const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
    const [ready, setReady] = useState(false);

    const apply = useCallback((next: UserPreferences) => {
        const root = document.getElementById("user-app");
        if (!root) return;
        applyPreferences(root, next);
    }, []);

    useEffect(() => {
        const stored = readStoredPreferences();
        const fromDb = normalizePreferences(dbPreferences);

        // localStorage is the latest client choice. Never overwrite it with a
        // stale DB payload after router.refresh() / soft navigation.
        const initial = stored ?? fromDb ?? DEFAULT_PREFERENCES;

        if (!stored && fromDb) {
            persist(fromDb);
        }

        setPrefs(initial);
        apply(initial);
        setReady(true);
    }, [apply, dbPreferences]);

    const setLocale = useCallback(
        (locale: Locale) => {
            setPrefs((current) => {
                const next = { ...current, locale };
                persist(next);
                apply(next);
                void updateUserPreferences(next).catch(console.error);
                return next;
            });
        },
        [apply],
    );

    const setTheme = useCallback(
        (theme: Theme) => {
            setPrefs((current) => {
                const next = { ...current, theme };
                persist(next);
                apply(next);
                void updateUserPreferences(next).catch(console.error);
                return next;
            });
        },
        [apply],
    );

    const setPalette = useCallback(
        (palette: Palette) => {
            setPrefs((current) => {
                const next = { ...current, palette };
                persist(next);
                apply(next);
                void updateUserPreferences(next).catch(console.error);
                return next;
            });
        },
        [apply],
    );

    const t = useMemo(() => createTranslator(prefs.locale), [prefs.locale]);

    const value = useMemo(
        () => ({
            locale: prefs.locale,
            theme: prefs.theme,
            palette: prefs.palette,
            setLocale,
            setTheme,
            setPalette,
            t,
            ready,
        }),
        [prefs.locale, prefs.theme, prefs.palette, setLocale, setTheme, setPalette, t, ready],
    );

    return (
        <UserPreferencesContext.Provider value={value}>
            {children}
        </UserPreferencesContext.Provider>
    );
}

export function useUserPreferences() {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error("useUserPreferences must be used within UserPreferencesProvider");
    }
    return context;
}
