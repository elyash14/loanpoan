'use client';

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";

export default function LinkRequiredView() {
    const { t } = useUserPreferences();
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

    return (
        <div className="flex min-h-dvh items-center justify-center px-4">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>{t("linkRequired.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
                    <p>{t("linkRequired.body")}</p>
                    {botUsername ? <p>{t("linkRequired.bot", { username: botUsername })}</p> : null}
                </CardContent>
            </Card>
        </div>
    );
}
