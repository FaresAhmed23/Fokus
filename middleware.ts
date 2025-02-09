import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

const locales = ["ar", "en"];
const publicPages = ["/", "/sign-in", "/sign-up"];

const intlMiddleware = createMiddleware({
	locales,
	defaultLocale: "en",
	// Add these optional configurations
	localePrefix: "always",
	// Optional: Add default timezone and formats
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

const authMiddleware = withAuth(
	function onSuccess(req) {
		return intlMiddleware(req);
	},
	{
		callbacks: {
			authorized: ({ token }) => token !== null,
		},
		pages: {
			signIn: "/sign-in",
		},
	},
);

export default function middleware(req: NextRequest) {
	const publicPathnameRegex = RegExp(
		`^(/(${locales.join("|")}))?(${publicPages.join("|")})?/?$`,
		"i",
	);
	const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

	if (isPublicPage) {
		return intlMiddleware(req);
	} else {
		return (authMiddleware as any)(req);
	}
}

export const config = {
	matcher: [
		"/((?!api|_next|.*\\..*).*)",
		"/((?!api|_next|.*\\.|favicon.ico).*)",
		"/",
	],
};
