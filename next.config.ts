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
				? {
						exclude: ["error", "warn"],
				  }
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
		// Optimize image quality vs size
		formats: ["image/webp"],
	},

	// Webpack optimizations
	// @ts-ignore
	webpack: (config, { isServer }) => {
		// Client-side polyfills only
		if (!isServer) {
			config.resolve = {
				...config.resolve,
				fallback: {
					...config.resolve?.fallback,
					fs: false,
					net: false,
					tls: false,
					child_process: false,
					debug: require.resolve("debug"),
					util: require.resolve("util/"),
					stream: require.resolve("stream-browserify"),
					path: require.resolve("path-browserify"),
					crypto: require.resolve("crypto-browserify"),
				},
			};
		}

		// Add bundle analyzer in analyze mode
		if (process.env.ANALYZE === "true") {
			const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
			config.plugins.push(
				new BundleAnalyzerPlugin({
					analyzerMode: "server",
					analyzerPort: isServer ? 8888 : 8889,
					openAnalyzer: true,
				}),
			);
		}

		// Optimize bundle size
		config.optimization = {
			...(config.optimization || {}),
			moduleIds: "deterministic",
			runtimeChunk: {
				name: "runtime",
			},
		};

		return config;
	},

	// Experimental features for performance
	experimental: {
		missingSuspenseWithCSRBailout: false,
		optimizeCss: true,
		optimizePackageImports: [
			"@radix-ui/react-icons",
			"@radix-ui/themes",
			"lucide-react",
			"date-fns",
			"emoji-mart",
		],
		serverActions: {
			bodySizeLimit: "2mb",
		},
		// Only enable when your app is ready
		// serverComponentsExternalPackages: ['bcryptjs'],
		// Output file tracing for serverless
		outputFileTracingRoot: path.join(__dirname, "../"),
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
