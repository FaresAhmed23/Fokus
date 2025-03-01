import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

// Define constants at the top for better maintainability and performance
const LOCALES = ["ar", "en"];
const DEFAULT_LOCALE = "en";
const PUBLIC_PAGES = ["/", "/sign-in", "/sign-up"];

// Precompile regex for better performance
const PUBLIC_PATHNAME_PATTERN = new RegExp(
	`^(/(${LOCALES.join("|")}))?(${PUBLIC_PAGES.join("|")})?/?$`,
	"i",
);

// Create middleware instance once
const intlMiddleware = createMiddleware({
	locales: LOCALES,
	defaultLocale: DEFAULT_LOCALE,
	localePrefix: "always",
	//@ts-ignore
	timeZone: "UTC",
	formats: {
		dateTime: {
			short: {
				day: "numeric",
				month: "short",
				year: "numeric",
			},
		},
	},
});

// Create auth middleware instance once
const authMiddleware = withAuth(
	// Success handler
	(req) => intlMiddleware(req),
	{
		callbacks: {
			authorized: ({ token }) => Boolean(token),
		},
		pages: {
			signIn: "/sign-in",
		},
	},
);

/**
 * Middleware handler for routing and authentication
 * Uses short-circuiting for better performance
 */
export default function middleware(req: NextRequest) {
	// Fast path - check if public page
	const isPublicPage = PUBLIC_PATHNAME_PATTERN.test(req.nextUrl.pathname);

	// Avoid unnecessary function calls with direct return
	return isPublicPage ? intlMiddleware(req) : (authMiddleware as any)(req);
}

// More specific matcher to improve performance
export const config = {
	matcher: [
		// Exclude static files and API routes for better performance
		"/((?!api|_next|_vercel|.*\\..*).+)",
		"/",
	],
};
