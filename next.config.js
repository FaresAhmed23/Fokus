const path = require("path");
const withNextIntl = require("next-intl/plugin")("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Remove or update experimental options that are not supported in Next.js 15
	experimental: {
		// missingSuspenseWithCSRBailout has been removed
	},
	env: {
		PRISMA_SCHEMA_PATH: "prisma/schema.prisma",
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		domains: ["uploadthing.com", "utfs.io"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "github.com",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "utfs.io",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
		],
	},
	webpack: (config, { isServer }) => {
		// Set up aliases for all paths (for both client and server)
		if (!config.resolve) {
			config.resolve = {};
		}

		// Make sure the alias object exists
		if (!config.resolve.alias) {
			config.resolve.alias = {};
		}

		// Add all your path aliases
		config.resolve.alias = {
			...config.resolve.alias,
			"@/lib/utils": path.resolve(__dirname, "./lib/utils.ts"),
			"@/lib": path.resolve(__dirname, "./lib"),
			"@/hooks": path.resolve(__dirname, "./hooks"),
			"@/components": path.resolve(__dirname, "./components"),
			"@/providers": path.resolve(__dirname, "./providers"),
			"@/types": path.resolve(__dirname, "./types"),
		};

		// Set up fallbacks for Node.js core modules (client-side only)
		if (!isServer) {
			if (!config.resolve.fallback) {
				config.resolve.fallback = {};
			}

			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
				child_process: false,
				debug: require.resolve("debug"),
				util: require.resolve("util"),
				stream: require.resolve("stream-browserify"),
				path: require.resolve("path-browserify"),
				crypto: require.resolve("crypto-browserify"),
			};
		}

		return config;
	},
};

// Wrap the nextConfig with withNextIntl
module.exports = withNextIntl(nextConfig);