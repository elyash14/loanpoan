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

function persist(prefs: UserPreferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
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
        let initial = DEFAULT_PREFERENCES;
        if (dbPreferences) {
            initial = dbPreferences;
            persist(dbPreferences);
        } else {
            const stored = readStoredPreferences();
            initial = stored ?? DEFAULT_PREFERENCES;
        }
        setPrefs(initial);
        apply(initial);
        setReady(true);
    }, [apply, dbPreferences]);

    const setLocale = useCallback(
        (locale: Locale) => {
            let next: UserPreferences | null = null;
            setPrefs((current) => {
                next = { ...current, locale };
                persist(next);
                apply(next);
                return next;
            });
            if (next) {
                updateUserPreferences(next).catch(console.error);
            }
        },
        [apply],
    );

    const setTheme = useCallback(
        (theme: Theme) => {
            let next: UserPreferences | null = null;
            setPrefs((current) => {
                next = { ...current, theme };
                persist(next);
                apply(next);
                return next;
            });
            if (next) {
                updateUserPreferences(next).catch(console.error);
            }
        },
        [apply],
    );

    const setPalette = useCallback(
        (palette: Palette) => {
            let next: UserPreferences | null = null;
            setPrefs((current) => {
                next = { ...current, palette };
                persist(next);
                apply(next);
                return next;
            });
            if (next) {
                updateUserPreferences(next).catch(console.error);
            }
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
