import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { validateTelegramInitData } from "./telegram";

describe("validateTelegramInitData", () => {
    const originalToken = process.env.TELEGRAM_BOT_TOKEN;

    beforeEach(() => {
        process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";
    });

    afterEach(() => {
        process.env.TELEGRAM_BOT_TOKEN = originalToken;
        vi.restoreAllMocks();
    });

    it("returns MISSING_TOKEN when env is unset", () => {
        delete process.env.TELEGRAM_BOT_TOKEN;
        const result = validateTelegramInitData("user=%7B%22id%22%3A1%7D");
        expect(result).toEqual({ ok: false, code: "MISSING_TOKEN" });
    });

    it("returns EXPIRED or INVALID for malformed initData", () => {
        const result = validateTelegramInitData("not-valid-init-data");
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(["EXPIRED", "INVALID"]).toContain(result.code);
        }
    });
});
