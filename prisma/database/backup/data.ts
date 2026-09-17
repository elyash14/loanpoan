import "server-only";

import { execFile } from "child_process";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type BackupFileInfo = {
    filename: string;
    sizeBytes: number;
    sizeFormatted: string;
    createdAt: string;
    path: string;
};

export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getBackupDirectory(): string {
    const dir = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
    if (!fsSync.existsSync(dir)) {
        fsSync.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

export function isValidBackupFilename(filename: string): boolean {
    if (!filename || typeof filename !== "string") return false;
    if (path.basename(filename) !== filename) return false;
    return /^financial(_backup)?_[a-zA-Z0-9_\-\.]+\.dump$/.test(filename);
}

export async function listBackupFiles(): Promise<BackupFileInfo[]> {
    const dir = getBackupDirectory();
    const files = await fs.readdir(dir);
    const results: BackupFileInfo[] = [];

    for (const file of files) {
        if (!isValidBackupFilename(file)) continue;
        const filePath = path.join(dir, file);
        try {
            const stat = await fs.stat(filePath);
            if (!stat.isFile()) continue;
            results.push({
                filename: file,
                sizeBytes: stat.size,
                sizeFormatted: formatBytes(stat.size),
                createdAt: stat.mtime.toISOString(),
                path: filePath,
            });
        } catch {
            // Ignore errors for individual files
        }
    }

    // Sort newest first
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getBackupFile(filename: string): Promise<{
    buffer: Buffer;
    info: BackupFileInfo;
}> {
    if (!isValidBackupFilename(filename)) {
        throw new Error("Invalid backup file name");
    }

    const dir = getBackupDirectory();
    const filePath = path.join(dir, filename);

    if (!fsSync.existsSync(filePath)) {
        throw new Error(`Backup file not found: ${filename}`);
    }

    const stat = await fs.stat(filePath);
    const buffer = await fs.readFile(filePath);

    return {
        buffer,
        info: {
            filename,
            sizeBytes: stat.size,
            sizeFormatted: formatBytes(stat.size),
            createdAt: stat.mtime.toISOString(),
            path: filePath,
        },
    };
}

export async function deleteBackupFile(filename: string): Promise<boolean> {
    if (!isValidBackupFilename(filename)) {
        throw new Error("Invalid backup file name");
    }

    const dir = getBackupDirectory();
    const filePath = path.join(dir, filename);

    if (fsSync.existsSync(filePath)) {
        await fs.unlink(filePath);
        return true;
    }

    return false;
}

export async function createDatabaseDumpFile(): Promise<BackupFileInfo> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured in environment");
    }

    // Strip query parameters from URL for pg_dump
    const pgUrl = databaseUrl.split("?")[0];
    const backupDir = getBackupDirectory();

    const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace("T", "_")
        .split(".")[0];
    const filename = `financial_backup_${timestamp}.dump`;
    const filePath = path.join(backupDir, filename);

    const envPath = [
        process.env.PATH || "",
        "/opt/homebrew/bin",
        "/usr/local/bin",
        "/usr/bin",
        "/bin",
    ]
        .filter(Boolean)
        .join(":");

    const args = [
        pgUrl,
        "--schema=public",
        "--format=custom",
        "--no-owner",
        "--no-privileges",
        `--file=${filePath}`,
    ];

    try {
        await execFileAsync("pg_dump", args, {
            env: {
                ...process.env,
                PATH: envPath,
            },
            timeout: 120000, // 2 minutes timeout
        });
    } catch (err: unknown) {
        if (fsSync.existsSync(filePath)) {
            await fs.unlink(filePath).catch(() => {});
        }
        const errorDetails =
            err && typeof err === "object"
                ? (err as { stderr?: string }).stderr || (err as Error).message || "Unknown error"
                : "Unknown error";
        throw new Error(`pg_dump failed: ${errorDetails}`);
    }

    const stat = await fs.stat(filePath);
    return {
        filename,
        sizeBytes: stat.size,
        sizeFormatted: formatBytes(stat.size),
        createdAt: stat.mtime.toISOString(),
        path: filePath,
    };
}
