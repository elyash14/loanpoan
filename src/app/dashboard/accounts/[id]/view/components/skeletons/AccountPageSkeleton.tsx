'use client'

import { Box, Grid, Skeleton } from "@mantine/core";

const AccountPageSkeleton = () => {
    return <>
        <Grid>
            <Grid.Col span={6} pl="xl">
                <Skeleton w="70%" height={30} mb="md" />
                <Skeleton w="70%" height={30} mb="md" />
                <Skeleton w="70%" height={30} mb="md" />
                <Skeleton w="70%" height={30} mb="md" />
                <Skeleton w="70%" height={30} mb="md" />
            </Grid.Col>
            <Grid.Col span={6}>
                <Box style={{ flexDirection: 'column', display: 'flex', alignItems: 'center' }}>
                    <Skeleton w="200" height={70} my="md" />
                    <Skeleton w="130" height={25} mt="lg" />
                </Box>
            </Grid.Col>
        </Grid>
    </>
}

export default AccountPageSkeleton;