import "./user-globals.css";
import TelegramProvider from "./components/telegram/TelegramProvider";
import { userPanelFont } from "./fonts";
import { cn } from "utils/cn";
import { ReactNode } from "react";

export default function UserApplicationLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div
            id="user-app"
            className={cn(userPanelFont.variable, "dark min-h-dvh antialiased")}
        >
            <TelegramProvider>{children}</TelegramProvider>
        </div>
    );
}
