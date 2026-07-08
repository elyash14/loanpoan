'use client';

import Money from "../../components/preferences/Money";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { Card, CardContent } from "../../components/ui/card";
import UserAvatar from "../../components/profile/UserAvatar";

type Props = {
    fullName: string;
    totalBalance: string;
    userAvatar?: string | null;
    userProfileColor?: string | null;
};

export default function HomeHero({ fullName, totalBalance, userAvatar, userProfileColor }: Props) {
    const { t } = useUserPreferences();

    return (
        <Card className="relative overflow-hidden border-border/40 bg-card shadow-sm">
            <div className="pointer-events-none absolute -end-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <CardContent className="relative space-y-5 pt-6 pb-6">
                <div className="flex items-center gap-3.5">
                    <UserAvatar 
                        name={fullName} 
                        avatar={userAvatar} 
                        profileColor={userProfileColor}
                        className="h-12 w-12 text-base ring-1 ring-primary/20 shadow-sm"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-muted-foreground/80">{t("home.welcome")}</p>
                        <h2 className="truncate text-xl font-bold tracking-tight text-foreground">{fullName}</h2>
                    </div>
                </div>
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        {t("home.totalBalance")}
                    </p>
                    <p className="mt-1.5 text-4xl font-black tracking-tight text-primary">
                        <Money value={totalBalance} />
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
