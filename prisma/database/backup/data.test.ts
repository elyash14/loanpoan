import { describe, expect, it } from "vitest";
import { formatBytes, isValidBackupFilename } from "./data";

describe("isValidBackupFilename", () => {
    it("accepts valid backup dump filenames", () => {
        expect(isValidBackupFilename("financial_backup_20260917_143000.dump")).toBe(true);
        expect(isValidBackupFilename("financial_20260917_143000.dump")).toBe(true);
        expect(isValidBackupFilename("financial_backup_12345.dump")).toBe(true);
    });

    it("rejects path traversal attempts", () => {
        expect(isValidBackupFilename("../financial_backup_123.dump")).toBe(false);
        expect(isValidBackupFilename("/etc/passwd")).toBe(false);
        expect(isValidBackupFilename("../../secret.dump")).toBe(false);
    });

    it("rejects invalid extensions and malformed names", () => {
        expect(isValidBackupFilename("financial_backup_123.sql")).toBe(false);
        expect(isValidBackupFilename("random_file.txt")).toBe(false);
        expect(isValidBackupFilename("")).toBe(false);
    });
});

describe("formatBytes", () => {
    it("formats 0 bytes correctly", () => {
        expect(formatBytes(0)).toBe("0 B");
    });

    it("formats KB correctly", () => {
        expect(formatBytes(1024)).toBe("1 KB");
        expect(formatBytes(2048)).toBe("2 KB");
    });

    it("formats MB correctly", () => {
        expect(formatBytes(1048576)).toBe("1 MB");
        expect(formatBytes(5242880)).toBe("5 MB");
    });
});
