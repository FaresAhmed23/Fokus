import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/providers/QueryProvider";

// Define constants
const SUPPORTED_LOCALES = ["en", "ar"];

export const metadata: Metadata = {
	title: "Fokus",
	description: "A Productivity App To Make You Focus and Stay Productive",
	applicationName: "Fokus",
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://fokus.app"),
	keywords: ["productivity", "focus", "time management", "task management"],
	viewport: "width=device-width, initial-scale=1",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "#171717" },
	],
};

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { locale: string };
}) {
	const { locale } = params;

	// Validate locale
	if (!SUPPORTED_LOCALES.includes(locale)) {
		notFound();
	}

	// Load messages
	const messages = await getMessages({ locale });
	const direction = locale === "ar" ? "rtl" : "ltr";

	return (
		<html lang={locale} dir={direction} suppressHydrationWarning>
			<head>
				{/* Preload critical assets */}
				<link
					rel="preconnect"
					href="https://uploadthing.com"
					crossOrigin="anonymous"
				/>
			</head>
			<body className="antialiased min-h-dvh">
				<NextIntlClientProvider locale={locale} messages={messages}>
					<AuthProvider>
						<QueryProvider>
							<ThemeProvider
								attribute="class"
								defaultTheme="system"
								enableSystem
								disableTransitionOnChange
							>
								<Toaster />
								{children}
							</ThemeProvider>
						</QueryProvider>
					</AuthProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
