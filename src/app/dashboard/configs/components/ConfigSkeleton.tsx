import { Skeleton } from "@mantine/core";

const ConfigSkeleton = () => {
    return <>
        <Skeleton w={100} height={30} />
        <Skeleton height={40} mt={5} />
        <Skeleton height={40} mt={5} />
        <Skeleton height={30} mt={6} w={100} />
    </>
}

export default ConfigSkeleton;