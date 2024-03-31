'use client'

import { useHydrateAtoms } from "jotai/utils";
import { globalConfigAtom } from "utils/stores/configs";
import { GlobalConfigType } from "utils/types/configs";

type Props = {
    globalConfig: GlobalConfigType
}

const HydrateData = ({ globalConfig }: Props) => {
    useHydrateAtoms([[globalConfigAtom, globalConfig]])

    return null;
}

export default HydrateData;