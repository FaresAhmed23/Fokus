// middleware.ts
import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

const locales = ["en", "ar"];
const publicPages = ["/", "/sign-in", "/sign-up"];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
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
  }
);

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join("|")}))?(${publicPages.join("|")})?/?$`,
    "i"
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    return authMiddleware(req);
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};