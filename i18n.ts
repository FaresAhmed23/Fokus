// i18n.ts
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export default getRequestConfig(async ({ locale }) => {
	// Validate locale
	if (!["en", "ar"].includes(locale)) notFound();

	return {
		messages: (await import(`./messages/${locale}.json`)).default,
		// Remove explicit locale setting as it's handled by middleware
		timeZone: "UTC",
	};
});
