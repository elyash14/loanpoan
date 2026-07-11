/** @type {import('next').NextConfig} */
function getAllowedDevOrigins() {
    const origins = new Set();

    if (process.env.DEV_ALLOWED_ORIGINS) {
        for (const entry of process.env.DEV_ALLOWED_ORIGINS.split(",")) {
            const trimmed = entry.trim();
            if (trimmed) origins.add(trimmed);
        }
    }

    if (process.env.NEXT_PUBLIC_APP_URL) {
        try {
            origins.add(new URL(process.env.NEXT_PUBLIC_APP_URL).hostname);
        } catch {
            // ignore invalid URL
        }
    }

    return [...origins];
}

const nextConfig = {
    allowedDevOrigins: getAllowedDevOrigins(),
    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
        // Next.js 16 proxy layer defaults to 1MB — must match serverActions limit for uploads
        proxyClientMaxBodySize: "6mb",
        serverActions: {
            bodySizeLimit: "6mb",
        },
    },
    serverActions: {
        bodySizeLimit: "6mb",
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/home',
                permanent: true,
            },
        ]
    },
};

export default nextConfig;
