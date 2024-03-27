import prisma from "@database/prisma";
import { unstable_cache } from "next/cache";

// using cache with tag to use this config all of application not in the specific path
export const getGlobalConfigs = unstable_cache(async () => {
    try {
        const result = await prisma.config.findFirst({
            where: {
                name: "global"
            }
        });
        return result?.value || {};
    } catch (error) {
        console.log(error);
        return {};
    }
},
    [],
    { tags: ["global-config"] }
);

export const getWaitingListConfigs = unstable_cache(async () => {
    try {
        const result = await prisma.config.findFirst({
            where: {
                name: "waiting_list"
            }
        });
        if (result === null) {
            createWaitingList();
        }

        return result?.value || {};
    } catch (error) {
        console.log(error);
        return {};
    }
},
    [],
    { tags: ["global-config"] }
);