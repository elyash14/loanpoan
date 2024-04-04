'use client'

import { Box, Grid, Skeleton, rem } from "@mantine/core";

const AccountOtherInfoPageSkeleton = () => {
    return <>
        <Grid>
            <Grid.Col span={6} pl="xl">
                <Skeleton w="150" height={20} mb={rem(40)} />
                <Box style={{ flexDirection: 'column', display: 'flex', alignItems: 'center' }}>
                    <Skeleton w="250" height={30} mb="md" />
                </Box>
                <Skeleton height={30} mb="md" mt="xl" />
                <Skeleton height={30} mb="md" />
                <Skeleton height={30} mb="md" />
                <Skeleton height={30} mb="md" />
                <Skeleton height={30} mb="md" />
            </Grid.Col>
            <Grid.Col span={6} pl="xl">
                <Skeleton w="100" height={20} mb={rem(40)} />
                <Box style={{ flexDirection: 'column', display: 'flex', alignItems: 'center' }}>
                    <Skeleton w="250" height={30} mb="md" />
                </Box>
                <Skeleton height={215} mt="xl" />
            </Grid.Col>
        </Grid>
    </>
}

export default AccountOtherInfoPageSkeleton;