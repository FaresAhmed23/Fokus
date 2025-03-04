const withNextIntl = require("next-intl/plugin")("./i18n.ts");
const path = require("path");

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	// Security: Remove powered by header to avoid fingerprinting
	poweredByHeader: false,

	// Performance and development settings
	reactStrictMode: true,
	swcMinify: true,

	// Ensure ReactFlow is properly transpiled
	transpilePackages: ["reactflow"],

	// Production optimizations for console statements
	compiler: {
		removeConsole:
			process.env.NODE_ENV === "production"
				? { exclude: ["error", "warn"] }
				: false,
	},

	// Webpack configuration
	webpack: (config, { dev, isServer }) => {
		// Enhanced path resolution - fixing the @/lib/utils issue
		config.resolve.alias = {
			...config.resolve.alias,
			"@/lib": path.resolve(__dirname, "./lib"),
		};

		// Ensure proper CSS handling for ReactFlow
		config.resolve = {
			...config.resolve,
			fallback: {
				...config.resolve?.fallback,
				fs: false,
				path: false,
			},
		};

		return config;
	},

	// Development checks - can be conditionally skipped
	typescript: {
		ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === "true",
	},
	eslint: {
		ignoreDuringBuilds: process.env.SKIP_LINT_CHECK === "true",
	},

	// Image optimization
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "github.com" },
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
			{ protocol: "https", hostname: "utfs.io" },
			{ protocol: "https", hostname: "avatars.githubusercontent.com" },
		],
		formats: ["image/webp"],
		minimumCacheTTL: 60,
		dangerouslyAllowSVG: false,
	},

	// Next.js experimental features
	experimental: {
		optimizeCss: false, // Consider enabling in future
		appDir: true,
		serverActions: {
			bodySizeLimit: "2mb",
		},
		optimizePackageImports: [
			"@radix-ui/react-icons",
			"@radix-ui/themes",
			"lucide-react",
			"date-fns",
			"emoji-mart",
		],
	},
};

module.exports = withNextIntl(nextConfig);
