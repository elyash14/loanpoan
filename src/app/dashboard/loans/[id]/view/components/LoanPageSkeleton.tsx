'use client'

import { Box, Grid, Skeleton, rem } from "@mantine/core";

const LoanPageSkeleton = () => {
    return <>
        <Grid>
            <Grid.Col span={6} pl="xl">
                <Skeleton w="70%" height={30} mb="md" />
                <Skeleton w="70%" height={30} mb="md" />
                <Skeleton w="70%" height={30} mb="md" />
                <Skeleton w="70%" height={30} mb="md" />
                <Skeleton w="70%" height={30} mb="md" />
                <Skeleton w="70%" height={30} mb="md" />
            </Grid.Col>
            <Grid.Col span={6} pl="xl">
                <Box style={{ flexDirection: 'column', display: 'flex', alignItems: 'center' }}>
                    <Skeleton circle height={120} mt="md" />
                    <Skeleton w="120" height={10} my="md" />
                    <Box display="flex">
                        <Skeleton w="130" height={30} mr={rem(5)} />
                        <Skeleton w="80" height={30} />
                    </Box>
                </Box>
            </Grid.Col>
        </Grid>
    </>
}

export default LoanPageSkeleton;