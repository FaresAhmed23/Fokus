// navigation.ts
"use client";

import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const locales = ["en", "ar"] as const;
export const { Link, useRouter, usePathname, redirect } =
  createSharedPathnamesNavigation({
    locales,
    localePrefix: "always",
  });