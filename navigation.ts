"use client";

import { createSharedPathnamesNavigation } from "next-intl/navigation";

// Define constants
const LOCALES = ["en", "ar"];

// Create and export navigation components with proper typing
export const { Link, useRouter, usePathname, redirect } =
	createSharedPathnamesNavigation({
		locales: LOCALES,
		localePrefix: "always",
		//@ts-ignore
		pathnames: {
			"/": "/",
			"/sign-in": "/sign-in",
			"/sign-up": "/sign-up",
			"/onboarding": "/onboarding",
			"/dashboard": "/dashboard",
			// Add any other routes you might need here
		},
	});
