'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TelegramBackButton() {
    const router = useRouter();

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.BackButton.show();
        const handler = () => router.back();
        tg.BackButton.onClick(handler);

        return () => {
            tg.BackButton.offClick(handler);
            tg.BackButton.hide();
        };
    }, [router]);

    return null;
}
