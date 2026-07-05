import { describe, expect, it } from "vitest";
import { resourceBelongsToUser } from "./ownership";

describe("resourceBelongsToUser", () => {
    it("accepts matching user ids", () => {
        expect(resourceBelongsToUser(5, 5)).toBe(true);
    });

    it("rejects mismatched user ids", () => {
        expect(resourceBelongsToUser(5, 9)).toBe(false);
    });

    it("rejects null or undefined owner", () => {
        expect(resourceBelongsToUser(5, null)).toBe(false);
        expect(resourceBelongsToUser(5, undefined)).toBe(false);
    });
});
