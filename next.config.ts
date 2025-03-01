const withNextIntl = require("next-intl/plugin")("./i18n.ts");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	poweredByHeader: false,
	reactStrictMode: true,
	swcMinify: true,
	transpilePackages: ["reactflow"],
	compiler: {
		removeConsole:
			process.env.NODE_ENV === "production"
				? { exclude: ["error", "warn"] }
				: false,
	},
	typescript: {
		ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === "true",
	},
	eslint: {
		ignoreDuringBuilds: process.env.SKIP_LINT_CHECK === "true",
	},
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "github.com" },
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
			{ protocol: "https", hostname: "utfs.io" },
			{ protocol: "https", hostname: "avatars.githubusercontent.com" },
		],
		formats: ["image/webp"],
	},
	experimental: {
		optimizeCss: false, // Disable this to avoid issues with reactflow CSS
		optimizePackageImports: [
			"@radix-ui/react-icons",
			"@radix-ui/themes",
			"lucide-react",
			"date-fns",
			"emoji-mart",
		], // Remove reactflow from here
	},
};

module.exports = withNextIntl(nextConfig);
