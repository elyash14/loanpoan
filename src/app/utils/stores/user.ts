import { atom } from "jotai";
import { SessionUser } from "utils/auth/session";

export const userAtom = atom<SessionUser | undefined>(undefined);