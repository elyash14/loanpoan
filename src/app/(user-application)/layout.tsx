import "./user-globals.css";
import TelegramProvider from "./components/telegram/TelegramProvider";
import UserPreferencesProvider from "./components/preferences/UserPreferencesProvider";
import { userPanelFont, userPanelFontFa } from "./fonts";
import { cn } from "utils/cn";
import { ReactNode } from "react";
import { DEFAULT_PREFERENCES, STORAGE_KEY } from "./i18n";

const themeBootstrapScript = `(function(){try{var r=document.getElementById("user-app");if(!r)return;var p=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"null");var t=p&&p.theme==="light"?"light":"dark";var l=p&&p.locale==="en"?"en":"fa";r.classList.remove("light","dark");r.classList.add(t);r.dataset.theme=t;r.dataset.locale=l;r.lang=l;r.dir=l==="fa"?"rtl":"ltr";}catch(e){var f=document.getElementById("user-app");if(f)f.classList.add(${JSON.stringify(DEFAULT_PREFERENCES.theme)});}})();`;

export default function UserApplicationLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div
            id="user-app"
            suppressHydrationWarning
            className={cn(
                userPanelFont.variable,
                userPanelFontFa.variable,
                DEFAULT_PREFERENCES.theme,
                "min-h-dvh antialiased",
            )}
        >
            <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
            <UserPreferencesProvider>
                <TelegramProvider>{children}</TelegramProvider>
            </UserPreferencesProvider>
        </div>
    );
}
