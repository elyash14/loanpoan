import { IBM_Plex_Sans, Vazirmatn } from "next/font/google";

export const userPanelFont = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    variable: "--font-user-panel",
});

export const userPanelFontFa = Vazirmatn({
    subsets: ["arabic"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    variable: "--font-user-panel-fa",
});
