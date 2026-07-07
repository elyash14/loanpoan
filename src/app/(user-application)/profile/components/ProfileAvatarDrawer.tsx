'use client';

import BottomDrawer from "../../components/ui/BottomDrawer";
import UserAvatar from "../../components/profile/UserAvatar";
import { Button } from "../../components/ui/button";
import { useUserPreferences } from "../../components/preferences/UserPreferencesProvider";
import { updateUserPanelAvatar } from "@database/user-panel/actions";
import { Camera } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    fullName: string;
    avatar: string | null;
    profileColor: string;
    onAvatarUpdated: (avatarUrl: string | null) => void;
};

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function ProfileAvatarDrawer({
    open,
    onClose,
    fullName,
    avatar,
    profileColor,
    onAvatarUpdated,
}: Props) {
    const { t } = useUserPreferences();
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const displayAvatar = preview ?? avatar;

    const resetSelection = () => {
        setPreview(null);
        setSelectedFile(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleClose = () => {
        resetSelection();
        setMessage(null);
        onClose();
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setMessage(null);
        setError(null);
        if (!file) {
            resetSelection();
            return;
        }
        if (!ALLOWED_TYPES.has(file.type)) {
            setError(t("profile.avatarInvalidType"));
            resetSelection();
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            setError(t("profile.avatarTooLarge"));
            resetSelection();
            return;
        }
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const onUpload = async () => {
        if (!selectedFile || isUploading) return;
        setIsUploading(true);
        setError(null);
        setMessage(null);
        const formData = new FormData();
        formData.append("avatar", selectedFile);
        const result = await updateUserPanelAvatar(formData);
        setIsUploading(false);
        if (result.status === "SUCCESS" && result.avatarUrl) {
            onAvatarUpdated(result.avatarUrl);
            setMessage(t("profile.avatarUpdated"));
            resetSelection();
            window.setTimeout(handleClose, 600);
        } else {
            const messageKey =
                result.message === "Invalid file type"
                    ? t("profile.avatarInvalidType")
                    : result.message === "File is too large"
                        ? t("profile.avatarTooLarge")
                        : t("profile.avatarUploadFailed");
            setError(messageKey);
        }
    };

    return (
        <BottomDrawer
            open={open}
            onClose={handleClose}
            title={t("profile.changeAvatar")}
            description={t("profile.changeAvatarDesc")}
        >
            <div className="flex flex-col items-center gap-4">
                <UserAvatar
                    name={fullName}
                    avatar={displayAvatar}
                    profileColor={profileColor}
                    size="lg"
                />

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onFileChange}
                />

                <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => inputRef.current?.click()}
                >
                    <Camera className="h-4 w-4" />
                    {t("profile.choosePhoto")}
                </Button>

                {selectedFile ? (
                    <p className="text-xs text-muted-foreground">{selectedFile.name}</p>
                ) : null}

                {error ? <p className="text-xs text-destructive">{error}</p> : null}
                {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}

                <Button
                    type="button"
                    className="w-full"
                    disabled={!selectedFile || isUploading}
                    onClick={onUpload}
                >
                    {isUploading ? t("profile.uploadingAvatar") : t("profile.uploadAvatar")}
                </Button>
            </div>
        </BottomDrawer>
    );
}
