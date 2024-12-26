// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID + ".supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    webpack(config, { isServer }) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        });

        // Add Playwright externals for server-side
        if (isServer) {
            config.externals.push({
                "playwright-core": "playwright-core",
            });
        }

        return config;
    },
};

export default nextConfig;
