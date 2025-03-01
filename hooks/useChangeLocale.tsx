import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export const useChangeLocale = () => {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const onSelectChange = async (nextLocale: string) => {
		setIsLoading(true);
		try {
			// Extract the current locale and path
			const segments = pathname.split("/");
			segments[1] = nextLocale; // Replace the locale segment
			const newPath = segments.join("/");

			router.push(newPath);
		} catch (error) {
			console.error("Error changing locale:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, onSelectChange };
};
