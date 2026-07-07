'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
    href?: string;
};

export default function TelegramBackButton({ href }: Props) {
    const router = useRouter();

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.BackButton.show();
        const handler = () => {
            if (href) {
                router.push(href);
            } else {
                router.back();
            }
        };
        tg.BackButton.onClick(handler);

        return () => {
            tg.BackButton.offClick(handler);
            tg.BackButton.hide();
        };
    }, [router, href]);

    return null;
}
