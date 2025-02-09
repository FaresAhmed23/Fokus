import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/providers/QueryProvider";

const locales = ["en", "ar"];

export const metadata: Metadata = {
	title: "Fokus",
	description: "Generated by create next app",
};

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { locale: string };
}) {
	// Destructure locale here (after the async context is ready)
	const { locale } = params;

	if (!["en", "ar"].includes(locale)) {
		notFound();
	}

	//@ts-ignore
	const messages = await getMessages({ locale });

	const direction = locale === "ar" ? "rtl" : "ltr";

	return (
		<html lang={locale} dir={direction} suppressHydrationWarning>
			<body className="antialiased">
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
