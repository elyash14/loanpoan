import { ActionResponse } from "utils/types/actionFormTypes";
import { z } from "zod";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const profileValidationSchema = z.object({
    profileColor: z.string().regex(HEX_COLOR_PATTERN, "Invalid color"),
});

export type ProfileResponseType = ActionResponse & {
    error?: {
        profileColor?: string[] | undefined;
    };
};
