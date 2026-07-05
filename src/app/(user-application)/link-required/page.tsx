import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function LinkRequiredPage() {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

    return (
        <div className="flex min-h-dvh items-center justify-center px-4">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Account not linked</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
                    <p>
                        Your Telegram account is not linked to a member profile yet.
                        Please contact an administrator to link your Telegram ID, then reopen this app.
                    </p>
                    {botUsername ? (
                        <p>
                            Bot: @{botUsername}
                        </p>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
