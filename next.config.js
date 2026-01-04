/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

module.exports = nextConfig;
