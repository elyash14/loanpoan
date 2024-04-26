'use client'

import { useHydrateAtoms } from "jotai/utils";
import { SessionUser } from "utils/auth/session";
import { globalConfigAtom } from "utils/stores/configs";
import { userAtom } from "utils/stores/user";
import { GlobalConfigType } from "utils/types/configs";

type Props = {
    globalConfig: GlobalConfigType
    user: SessionUser
}

const HydrateData = ({ globalConfig, user }: Props) => {
    useHydrateAtoms([
        [globalConfigAtom, globalConfig],
        [userAtom, user]
    ]);
    return null;
}

export default HydrateData;