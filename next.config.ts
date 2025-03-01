const withNextIntl = require("next-intl/plugin")("./i18n.ts");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ["reactflow"],

	// Explicitly set up the path alias in webpack
	//@ts-ignore
	webpack: (config) => {
		config.resolve.alias = {
			...config.resolve.alias,
			"@": path.resolve(__dirname),
			"@/lib": path.resolve(__dirname, "lib"),
		};
		return config;
	},

	// Disable features that could be causing issues
	experimental: {
		optimizeCss: false,
	},
};

module.exports = withNextIntl(nextConfig);
