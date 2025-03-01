const withNextIntl = require("next-intl/plugin")("./i18n.ts");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Production optimization flags
	poweredByHeader: false,
	reactStrictMode: true,
	swcMinify: true,
	compiler: {
		removeConsole:
			process.env.NODE_ENV === "production"
				? { exclude: ["error", "warn"] }
				: false,
	},

	// Handle type checking separately for better build performance
	typescript: {
		ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === "true",
	},
	eslint: {
		ignoreDuringBuilds: process.env.SKIP_LINT_CHECK === "true",
	},

	// Image optimization
	images: {
		domains: ["uploadthing.com", "utfs.io"],
		remotePatterns: [
			{ protocol: "https", hostname: "github.com" },
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
			{ protocol: "https", hostname: "utfs.io" },
			{ protocol: "https", hostname: "avatars.githubusercontent.com" },
		],
		formats: ["image/webp"],
	},

	// Ensure reactflow is properly handled
	transpilePackages: ["reactflow"],

	// Simplified webpack configuration - only necessary parts
	webpack: (config, { isServer }) => {
		// Add path aliases
		config.resolve.alias = {
			...config.resolve.alias,
			"@": path.resolve(__dirname),
			"@/lib": path.resolve(__dirname, "lib"),
		};

		// Client-side polyfills only
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve?.fallback,
				fs: false,
				net: false,
				tls: false,
				child_process: false,
				stream: require.resolve("stream-browserify"),
				crypto: require.resolve("crypto-browserify"),
				buffer: require.resolve("buffer/"),
				process: require.resolve("process/browser"),
			};

			// Add necessary providers
			config.plugins.push(
				new (require("webpack").ProvidePlugin)({
					process: "process/browser",
					Buffer: ["buffer", "Buffer"],
				}),
			);
		}

		return config;
	},

	// Experimental features for performance
	experimental: {
		optimizeCss: true,
		optimizePackageImports: [
			"@radix-ui/react-icons",
			"@radix-ui/themes",
			"lucide-react",
			"date-fns",
			"emoji-mart",
			"reactflow",
		],
		serverActions: {
			bodySizeLimit: "2mb",
		},
	},

	// CDN cache settings
	headers: async () => {
		return [
			{
				source: "/fonts/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/images/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=86400",
					},
				],
			},
		];
	},
};

module.exports = withNextIntl(nextConfig);
