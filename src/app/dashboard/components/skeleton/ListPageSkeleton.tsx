import { Box, Skeleton } from "@mantine/core";

const ListPageSkeleton = () => {
    return <>
        <Box display={'flex'} mb={20}>
            <Box flex={1}>
                <Skeleton w={100} height={30} />
            </Box>
            <Skeleton w={200} height={30} />
            <Skeleton w={50} height={30} ml={5} />
        </Box>
        {Array(10).fill(1).map((_, index) => (
            <Skeleton key={index} height={35} mt={5} />
        ))}
        <Skeleton height={30} mt={6} w={100} />
    </>
}

export default ListPageSkeleton;