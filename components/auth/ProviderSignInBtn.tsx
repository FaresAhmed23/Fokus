"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useLocale } from "next-intl";
import { useProviderLoginError } from "@/hooks/useProviderLoginError";
import { signIn } from "next-auth/react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	providerName: "google" | "github";
	onLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ProviderSignInBtn = ({
	children,
	providerName,
	onLoading,
	...props
}: Props) => {
	const [showLoggedInfo, setShowLoggedInfo] = useState(false);
	const locale = useLocale();
	useProviderLoginError(showLoggedInfo);

	const signInHandler = async () => {
		try {
			onLoading(true);
			setShowLoggedInfo(true);
			const result = await signIn(providerName, {
				callbackUrl: `/${locale}/onboarding`,
				redirect: true, // Change this to true
			});

			// This code will only run if redirect is false
			if (result?.error) {
				console.error("Failed to sign in:", result.error);
			} else if (result?.url) {
				window.location.href = result.url;
			}
		} catch (err) {
			console.error("Sign in error:", err);
		} finally {
			onLoading(false);
		}
	};

	return (
		<Button
			onClick={signInHandler}
			{...props}
			variant="secondary"
			type="button"
		>
			{children}
		</Button>
	);
};
