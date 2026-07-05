import { describe, expect, it } from "vitest";
import { sanitizeWebhookSecret, validateTelegramGroupChatId } from "./config";

describe("sanitizeWebhookSecret", () => {
    it("accepts valid secrets", () => {
        expect(sanitizeWebhookSecret("abc123_-")).toBe("abc123_-");
    });

    it("rejects secrets with special characters", () => {
        expect(() => sanitizeWebhookSecret("bad&secret")).toThrow(/unallowed|letters/);
    });
});

describe("validateTelegramGroupChatId", () => {
    it("accepts supergroup ids", () => {
        expect(validateTelegramGroupChatId("-1001234567890")).toBe(-1001234567890n);
    });

    it("rejects likely user ids", () => {
        expect(() => validateTelegramGroupChatId("107945658")).toThrow(/user ID/);
    });
});
