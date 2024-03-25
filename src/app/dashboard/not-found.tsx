import { Box } from '@mantine/core';
import Link from 'next/link';
import { DASHBOARD_URL } from 'utils/configs';

export default function NotFound() {
    return (
        <Box ta={'center'} mt={200}>
            <h1>Not Found!</h1>
            <h3>TODO: must be change this page!</h3>
            <Link href={`/${DASHBOARD_URL}`}>
                Go to Dashboard
            </Link>
        </Box>
    );
}