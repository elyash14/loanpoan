'use client';

import { Grid, Paper, SimpleGrid, Skeleton } from "@mantine/core";

const DashboardSkeleton = () => {
    return (
        <>
            <Paper withBorder p="md" mb="md">
                <Skeleton height={16} width={240} mb="sm" />
                <Skeleton height={32} width={180} />
            </Paper>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="xl">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Paper key={index} withBorder p="md">
                        <Skeleton height={16} width="60%" mb="sm" />
                        <Skeleton height={28} width="80%" />
                    </Paper>
                ))}
            </SimpleGrid>
            <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper withBorder p="md">
                        <Skeleton height={24} width={180} mb="md" />
                        <Skeleton height={300} />
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper withBorder p="md">
                        <Skeleton height={24} width={160} mb="md" />
                        <Skeleton height={300} circle mx="auto" />
                    </Paper>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Paper withBorder p="md">
                        <Skeleton height={24} width={200} mb="md" />
                        <Skeleton height={120} />
                    </Paper>
                </Grid.Col>
            </Grid>
            <Paper withBorder p="md" mt="xl">
                <Skeleton height={24} width={220} mb="lg" />
                <Skeleton height={40} mb="sm" />
                <Skeleton height={40} mb="sm" />
                <Skeleton height={40} />
            </Paper>
        </>
    );
};

export default DashboardSkeleton;
