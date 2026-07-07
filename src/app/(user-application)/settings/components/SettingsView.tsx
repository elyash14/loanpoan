'use client';

import { cn } from "utils/cn";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import type { Locale, Palette, Theme } from "../../i18n";
import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";

function OptionButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
            )}
        >
            {children}
        </button>
    );
}

export default function SettingsView() {
    const { locale, theme, palette, setLocale, setTheme, setPalette, t } = useUserPreferences();

    const locales: { id: Locale; label: string }[] = [
        { id: "fa", label: t("settings.farsi") },
        { id: "en", label: t("settings.english") },
    ];

    const themes: { id: Theme; label: string; icon: typeof Sun }[] = [
        { id: "light", label: t("settings.light"), icon: Sun },
        { id: "dark", label: t("settings.dark"), icon: Moon },
    ];

    const palettes: { id: Palette; label: string; preview: string }[] = [
        { id: "ocean", label: t("settings.paletteOcean"), preview: "from-sky-500 to-cyan-400" },
        { id: "violet", label: t("settings.paletteViolet"), preview: "from-violet-500 to-fuchsia-400" },
        { id: "sunset", label: t("settings.paletteSunset"), preview: "from-orange-500 to-amber-400" },
        { id: "emerald", label: t("settings.paletteEmerald"), preview: "from-emerald-500 to-teal-400" },
        { id: "rose", label: t("settings.paletteRose"), preview: "from-rose-500 to-pink-400" },
    ];

    return (
        <div className="space-y-4">
            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)]/70 bg-[var(--color-card)] p-4 shadow-[var(--shadow-soft)]">
                <h2 className="font-medium">{t("settings.language")}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    {t("settings.languageDesc")}
                </p>
                <div className="mt-3 flex gap-2 rounded-[var(--radius-lg)] bg-[var(--color-muted)]/60 p-1">
                    {locales.map(({ id, label }) => (
                        <OptionButton key={id} active={locale === id} onClick={() => setLocale(id)}>
                            {label}
                        </OptionButton>
                    ))}
                </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)]/70 bg-[var(--color-card)] p-4 shadow-[var(--shadow-soft)]">
                <h2 className="font-medium">{t("settings.theme")}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    {t("settings.themeDesc")}
                </p>
                <div className="mt-3 flex gap-2 rounded-[var(--radius-lg)] bg-[var(--color-muted)]/60 p-1">
                    {themes.map(({ id, label, icon: Icon }) => (
                        <OptionButton key={id} active={theme === id} onClick={() => setTheme(id)}>
                            <span className="inline-flex items-center justify-center gap-1.5">
                                <Icon className="h-4 w-4" strokeWidth={1.75} />
                                {label}
                            </span>
                        </OptionButton>
                    ))}
                </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)]/70 bg-[var(--color-card)] p-4 shadow-[var(--shadow-soft)]">
                <h2 className="font-medium">{t("settings.palette")}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                    {t("settings.paletteDesc")}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2">
                    {palettes.map(({ id, label, preview }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setPalette(id)}
                            className={cn(
                                "flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-sm transition-colors",
                                palette === id
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                    : "border-[var(--color-border)] hover:bg-[var(--color-muted)]/60",
                            )}
                        >
                            <span className={cn("h-5 w-10 rounded-full bg-gradient-to-r", preview)} />
                            <span className="font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}
