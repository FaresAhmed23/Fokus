const withNextIntl = require("next-intl/plugin")();

/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		// Disable ESLint during builds
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
	//@ts-ignore
	webpack: (config, { isServer }) => {
		if (!isServer) {
			if (!config.resolve) {
				config.resolve = {};
			}
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
				util: require.resolve("util/"),
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
