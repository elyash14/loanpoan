import "server-only";

import { mkdir, unlink, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { constants as fsConstants } from "node:fs";

const AVATAR_URL_PREFIXES = ["/api/avatars/", "/uploads/avatars/"] as const;

/** Writable dir for runtime uploads (works with Next standalone / Docker). */
export function getAvatarUploadsDir() {
    const configured = process.env.UPLOADS_DIR?.trim();
    if (configured) {
        return path.join(configured, "avatars");
    }
    return path.join(process.cwd(), "uploads", "avatars");
}

export function avatarPublicUrl(fileName: string) {
    return `/api/avatars/${fileName}`;
}

export function extractAvatarFileName(avatarUrl: string | null | undefined): string | null {
    if (!avatarUrl) return null;
    for (const prefix of AVATAR_URL_PREFIXES) {
        if (avatarUrl.startsWith(prefix)) {
            const name = avatarUrl.slice(prefix.length).split(/[/?#]/)[0];
            return name && !name.includes("..") && !name.includes("/") ? name : null;
        }
    }
    return null;
}

export async function ensureAvatarUploadsDir() {
    const dir = getAvatarUploadsDir();
    await mkdir(dir, { recursive: true });
    return dir;
}

export async function saveAvatarFile(fileName: string, buffer: Buffer) {
    const dir = await ensureAvatarUploadsDir();
    const filePath = path.join(dir, fileName);
    await writeFile(filePath, buffer);
    return filePath;
}

export async function removeAvatarFile(avatarUrl: string | null | undefined) {
    const fileName = extractAvatarFileName(avatarUrl);
    if (!fileName) return;

    const candidates = [
        path.join(getAvatarUploadsDir(), fileName),
        // Legacy location from earlier public/uploads writes
        path.join(process.cwd(), "public", "uploads", "avatars", fileName),
    ];

    for (const filePath of candidates) {
        try {
            await unlink(filePath);
        } catch {
            // ignore missing files
        }
    }
}

export async function resolveAvatarFilePath(fileName: string): Promise<string | null> {
    if (!fileName || fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
        return null;
    }

    const candidates = [
        path.join(getAvatarUploadsDir(), fileName),
        path.join(process.cwd(), "public", "uploads", "avatars", fileName),
    ];

    for (const filePath of candidates) {
        try {
            await access(filePath, fsConstants.R_OK);
            return filePath;
        } catch {
            // try next
        }
    }
    return null;
}

export function contentTypeForAvatarFile(fileName: string) {
    if (fileName.endsWith(".png")) return "image/png";
    if (fileName.endsWith(".webp")) return "image/webp";
    return "image/jpeg";
}
