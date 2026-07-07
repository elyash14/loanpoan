'use client';

import UserAvatar from "../../components/profile/UserAvatar";
import {
    SUGGESTED_PROFILE_COLORS,
    isSameProfileColor,
    normalizeProfileColor,
} from "../../components/profile/profileColors";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import UserLogout from "../../components/UserLogout";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../../components/preferences/useLocaleFormat";
import { clearUserPanelAvatar, updateUserPanelProfile } from "@database/user-panel/actions";
import ProfileAvatarDrawer from "./ProfileAvatarDrawer";
import ProfilePasswordDrawer from "./ProfilePasswordDrawer";
import { cn } from "utils/cn";
import { Camera, ChevronRight, KeyRound, Trash2, type LucideIcon } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

type Profile = {
    id: number;
    email: string;
    fullName: string;
    cardNumber: string | null;
    accountNumber: string | null;
    telegramUsername: string | null;
    telegramId: string | null;
    avatar: string | null;
    profileColor: string | null;
    createdAt: string;
    lastLoginAt: string | null;
};

type Props = {
    profile: string;
    authProvider: string;
};

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 py-2.5 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-end text-sm font-medium break-all">{value}</span>
        </div>
    );
}

function AvatarIconButton({
    icon: Icon,
    label,
    onClick,
    disabled = false,
    destructive = false,
}: {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                "disabled:pointer-events-none disabled:opacity-40",
                destructive
                    ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
                    : "border-[var(--color-border)] bg-[var(--color-muted)]/50 text-[var(--color-foreground)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/12 hover:text-[var(--color-primary)]",
            )}
        >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
        </button>
    );
}

function ProfileActionRow({
    icon: Icon,
    label,
    description,
    onClick,
    disabled = false,
}: {
    icon: LucideIcon;
    label: string;
    description?: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="group flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-1 py-3 text-start transition-[background-color,transform] duration-200 hover:bg-[var(--color-muted)]/50 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block font-medium">{label}</span>
                {description ? (
                    <span className="block text-xs text-[var(--color-muted-foreground)]">{description}</span>
                ) : null}
            </span>
            <ChevronRight className="rtl-flip h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </button>
    );
}

export default function ProfileView({ profile, authProvider }: Props) {
    const user = useMemo(() => JSON.parse(profile) as Profile, [profile]);
    const { t } = useUserPreferences();
    const { formatDate, formatDigits } = useLocaleFormat();
    const isEmailAuth = authProvider !== "telegram";
    const [avatar, setAvatar] = useState(user.avatar);
    const [profileColor, setProfileColor] = useState(
        normalizeProfileColor(user.profileColor),
    );
    const [colorMessage, setColorMessage] = useState<string | null>(null);
    const [avatarDrawerOpen, setAvatarDrawerOpen] = useState(false);
    const [passwordDrawerOpen, setPasswordDrawerOpen] = useState(false);
    const [isSavingColor, startColorTransition] = useTransition();
    const [isClearingAvatar, startClearAvatarTransition] = useTransition();
    const [avatarMessage, setAvatarMessage] = useState<string | null>(null);

    const lastLoginLabel = user.lastLoginAt
        ? formatDate(user.lastLoginAt, "MMM D, YYYY HH:mm")
        : t("profile.lastLoginNever");

    const handleClearAvatar = () => {
        if (!avatar || isClearingAvatar) return;
        setAvatarMessage(null);
        startClearAvatarTransition(async () => {
            const result = await clearUserPanelAvatar();
            if (result.status === "SUCCESS") {
                setAvatar(null);
                setAvatarMessage(t("profile.avatarCleared"));
            } else {
                setAvatarMessage(t("profile.avatarClearFailed"));
            }
        });
    };

    const saveProfileColor = (color: string) => {
        const normalized = normalizeProfileColor(color);
        if (isSameProfileColor(normalized, profileColor) || isSavingColor) return;
        setProfileColor(normalized);
        setColorMessage(null);
        startColorTransition(async () => {
            const formData = new FormData();
            formData.append("profileColor", normalized);
            const result = await updateUserPanelProfile(formData);
            if (result.status === "SUCCESS") {
                setColorMessage(t("profile.colorUpdated"));
            } else {
                setProfileColor(normalizeProfileColor(user.profileColor));
            }
        });
    };

    const isCustomColor = !SUGGESTED_PROFILE_COLORS.some((color) =>
        isSameProfileColor(color, profileColor),
    );

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <CardContent className="flex flex-col items-center gap-3 pt-6 pb-5 text-center">
                    <UserAvatar
                        name={user.fullName}
                        avatar={avatar}
                        profileColor={profileColor}
                        size="lg"
                    />

                    <div className="flex items-center justify-center gap-3">
                        <AvatarIconButton
                            icon={Camera}
                            label={t("profile.changeAvatar")}
                            onClick={() => setAvatarDrawerOpen(true)}
                        />
                        <AvatarIconButton
                            icon={Trash2}
                            label={t("profile.clearAvatar")}
                            onClick={handleClearAvatar}
                            disabled={!avatar || isClearingAvatar}
                            destructive
                        />
                    </div>

                    {avatarMessage ? (
                        <p className="text-xs text-muted-foreground">{avatarMessage}</p>
                    ) : null}

                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold tracking-tight">{user.fullName}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t("profile.memberSince")} {formatDate(user.createdAt, "MMM D, YYYY")}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-1">
                    <CardTitle className="text-base">{t("profile.security")}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t("profile.securityDesc")}</p>
                </CardHeader>
                <CardContent className="space-y-1 pt-0">
                    <InfoRow label={t("profile.lastLogin")} value={lastLoginLabel} />
                    <ProfileActionRow
                        icon={KeyRound}
                        label={t("profile.changePassword")}
                        description={t("profile.changePasswordDesc")}
                        onClick={() => setPasswordDrawerOpen(true)}
                    />
                    {isEmailAuth ? (
                        <div className="pt-2">
                            <UserLogout label={t("profile.logout")} />
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            <section className="rounded-xl border border-border/70 bg-card p-4 shadow-(--shadow-soft)">
                <h2 className="font-medium">{t("profile.profileColor")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("profile.profileColorDesc")}</p>

                <p className="mt-4 text-xs font-medium text-muted-foreground">{t("profile.suggestedColors")}</p>
                <div className="mt-2 flex flex-wrap gap-2.5">
                    {SUGGESTED_PROFILE_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            disabled={isSavingColor}
                            onClick={() => saveProfileColor(color)}
                            aria-label={color}
                            className={cn(
                                "h-10 w-10 rounded-full transition-transform active:scale-95",
                                isSameProfileColor(color, profileColor)
                                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                                    : "ring-1 ring-border/80",
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                <p className="mt-4 text-xs font-medium text-muted-foreground">{t("profile.customColor")}</p>
                <div className="mt-2 flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
                    <label className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-border/80">
                        <input
                            type="color"
                            value={profileColor}
                            disabled={isSavingColor}
                            onChange={(event) => saveProfileColor(event.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
                            aria-label={t("profile.customColor")}
                        />
                    </label>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium tabular-nums">{profileColor}</p>
                        {isCustomColor ? (
                            <p className="text-xs text-muted-foreground">{t("profile.customColor")}</p>
                        ) : null}
                    </div>
                </div>

                {colorMessage ? (
                    <p className="mt-2 text-xs text-muted-foreground">{colorMessage}</p>
                ) : null}
            </section>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t("profile.accountInfo")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <InfoRow label={t("profile.email")} value={user.email} />
                    {user.cardNumber ? (
                        <InfoRow label={t("profile.cardNumber")} value={formatDigits(user.cardNumber)} />
                    ) : null}
                    {user.accountNumber ? (
                        <InfoRow label={t("profile.bankAccount")} value={formatDigits(user.accountNumber)} />
                    ) : null}
                    {user.telegramUsername ? (
                        <InfoRow label={t("profile.telegram")} value={`@${user.telegramUsername}`} />
                    ) : null}
                </CardContent>
            </Card>

            <ProfileAvatarDrawer
                open={avatarDrawerOpen}
                onClose={() => setAvatarDrawerOpen(false)}
                fullName={user.fullName}
                avatar={avatar}
                profileColor={profileColor}
                onAvatarUpdated={setAvatar}
            />

            <ProfilePasswordDrawer
                open={passwordDrawerOpen}
                onClose={() => setPasswordDrawerOpen(false)}
                userId={user.id}
            />
        </div>
    );
}
