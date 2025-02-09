"use client";

import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const { Link, useRouter, usePathname, redirect } =
	createSharedPathnamesNavigation({
		locales: ["en", "ar"],
		localePrefix: "always",
		//@ts-ignore
		pathnames: {
			"/": "/",
			"/sign-in": "/sign-in",
			"/sign-up": "/sign-up",
			"/onboarding": "/onboarding",
			"/dashboard": "/dashboard",
		},
	});
