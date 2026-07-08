'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TelegramLoginRedirect() {
    const router = useRouter();

    useEffect(() => {
        if (window.Telegram?.WebApp?.initData) {
            router.replace("/home");
        }
    }, [router]);

    return null;
}
