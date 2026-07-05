'use client';

import { Box, Group, Skeleton } from "@mantine/core";

const UserPageSkeleton = () => {
    return (
        <>
            <Group justify="flex-end" mb="md">
                <Skeleton w={70} height={30} />
            </Group>
            <Group mb="md" gap="sm">
                <Skeleton w={80} height={36} />
                <Skeleton w={120} height={36} />
                <Skeleton w={150} height={36} />
                <Skeleton w={100} height={36} />
            </Group>
            <Box pl="xl">
                <Skeleton w="60%" height={30} mb="md" />
                <Skeleton w="60%" height={30} mb="md" />
                <Skeleton w="60%" height={30} mb="md" />
                <Skeleton w="60%" height={30} mb="md" />
                <Skeleton w="60%" height={30} mb="md" />
            </Box>
        </>
    );
};

export default UserPageSkeleton;
