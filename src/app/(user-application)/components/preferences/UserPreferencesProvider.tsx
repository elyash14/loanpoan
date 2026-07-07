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

function persist(prefs: UserPreferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export default function UserPreferencesProvider({ children }: { children: ReactNode }) {
    const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
    const [ready, setReady] = useState(false);

    const apply = useCallback((next: UserPreferences) => {
        const root = document.getElementById("user-app");
        if (!root) return;
        applyPreferences(root, next);
    }, []);

    useEffect(() => {
        const stored = readStoredPreferences();
        const initial = stored ?? DEFAULT_PREFERENCES;
        setPrefs(initial);
        apply(initial);
        setReady(true);
    }, [apply]);

    const setLocale = useCallback(
        (locale: Locale) => {
            setPrefs((current) => {
                const next = { ...current, locale };
                persist(next);
                apply(next);
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
