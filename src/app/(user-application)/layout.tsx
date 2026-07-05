import "./user-globals.css";
import TelegramProvider from "./components/telegram/TelegramProvider";
import { ReactNode } from "react";

export default function UserApplicationLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div id="user-app" className="min-h-dvh">
            <TelegramProvider>{children}</TelegramProvider>
        </div>
    );
}
