// i18n.ts
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// Define supported locales
const SUPPORTED_LOCALES = ["en", "ar"];

// Fixed getRequestConfig to explicitly return locale
export default getRequestConfig(async ({ locale }) => {
	// Validate locale
	if (!SUPPORTED_LOCALES.includes(locale)) {
		notFound();
	}

	try {
		// Load messages for the validated locale
		const messages = (await import(`./messages/${locale}.json`)).default;

		return {
			locale: locale, // Add this line to explicitly return the locale
			messages,
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
		};
	} catch (error) {
		console.error(`Failed to load messages for locale: ${locale}`, error);
		// Fallback to default locale if translation file is missing
		if (locale !== "en") {
			const defaultMessages = (await import(`./messages/en.json`)).default;
			return {
				locale: "en", // Also include locale in fallback case
				messages: defaultMessages,
				timeZone: "UTC",
			};
		}
		// If even default locale fails, throw error
		throw error;
	}
});
