import "./user-globals.css";
import TelegramProvider from "./components/telegram/TelegramProvider";
import UserPreferencesProvider from "./components/preferences/UserPreferencesProvider";
import { userPanelFont, userPanelFontFa } from "./fonts";
import { cn } from "utils/cn";
import { ReactNode } from "react";
import { DEFAULT_PREFERENCES, STORAGE_KEY, type UserPreferences } from "./i18n";
import { getPanelUserSession } from "utils/auth/userSession";
import prisma from "@database/prisma";

const themeBootstrapScript = `(function(){try{var r=document.getElementById("user-app");if(!r)return;var p=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"null");var t=p&&p.theme==="light"?"light":"dark";var l=p&&p.locale==="en"?"en":"fa";r.classList.remove("light","dark");r.classList.add(t);r.dataset.theme=t;r.dataset.locale=l;r.lang=l;r.dir=l==="fa"?"rtl":"ltr";}catch(e){var f=document.getElementById("user-app");if(f)f.classList.add(${JSON.stringify(DEFAULT_PREFERENCES.theme)});}})();`;

export default async function UserApplicationLayout({
    children,
}: {
    children: ReactNode;
}) {
    const session = await getPanelUserSession();
    let dbPreferences: UserPreferences | null = null;

    if (session?.userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: Number(session.userId) },
                select: { preferences: true },
            });
            if (user?.preferences) {
                dbPreferences = user.preferences as unknown as UserPreferences;
            }
        } catch (error) {
            console.error("Failed to fetch user preferences from database:", error);
        }
    }

    const initialTheme = dbPreferences?.theme ?? DEFAULT_PREFERENCES.theme;

    return (
        <div
            id="user-app"
            suppressHydrationWarning
            className={cn(
                userPanelFont.variable,
                userPanelFontFa.variable,
                initialTheme,
                "min-h-dvh antialiased",
            )}
        >
            <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
            <UserPreferencesProvider dbPreferences={dbPreferences}>
                <TelegramProvider>{children}</TelegramProvider>
            </UserPreferencesProvider>
        </div>
    );
}
