"use client";

import { useGetAssignedToMeParams } from "@/hooks/useGetAssignedToMeParams";
import { useInfiniteQuery } from "@tanstack/react-query";
import { HomeRecentActivity } from "@/types/extended";
import { ClientError } from "../error/ClientError";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntersection } from "@mantine/hooks";
import { LoadingState } from "../ui/loadingState";
import { HomeRecentActivityItem } from "./HomeRecentActivityItem";
import { ACTIVITY_PER_PAGE } from "@/lib/constants";
import { Activity } from "lucide-react";

interface Props {
	userId: string;
	initialData: HomeRecentActivity[];
}

export const HomeRecentActivityContainer = ({ userId, initialData }: Props) => {
	const t = useTranslations("HOME_PAGE");
	const [isAllFetched, setIsAllFetched] = useState(false);

	// Create intersection observer for infinite scrolling
	const { entry, ref } = useIntersection({
		threshold: 0.5, // Lower threshold for earlier loading
		rootMargin: "200px", // Start loading before item is visible
	});

	// Optimize fetch function with useCallback
	const fetchActivities = useCallback(
		async ({ pageParam = 1 }) => {
			const res = await fetch(
				`/api/home-page/get?userId=${userId}&page=${pageParam}&take=${ACTIVITY_PER_PAGE}`,
				{ cache: "no-store" }, // Don't cache these requests
			);

			if (!res.ok) {
				throw new Error("Failed to fetch activities");
			}

			return res.json() as Promise<HomeRecentActivity[]>;
		},
		[userId],
	);

	// Optimized query with better caching strategy
	const { data, isFetchingNextPage, fetchNextPage, isError, hasNextPage } =
		useInfiniteQuery({
			initialPageParam: 1,
			queryKey: ["getHomeRecentActivity", userId],
			queryFn: fetchActivities,
			getNextPageParam: (lastPage, pages) => {
				// Don't create a new page param if we got fewer items than requested
				return lastPage.length < ACTIVITY_PER_PAGE
					? undefined
					: pages.length + 1;
			},
			initialData:
				initialData.length > 0
					? {
							pages: [initialData],
							pageParams: [1],
					  }
					: undefined,
			staleTime: 60 * 1000, // 1 minute stale time
			refetchOnWindowFocus: false, // Disable automatic refetching
		});

	// Fetch next page when scrolling to bottom
	useEffect(() => {
		if (!isAllFetched && entry?.isIntersecting && hasNextPage) {
			fetchNextPage();
		}
	}, [entry, isAllFetched, fetchNextPage, hasNextPage]);

	// Process activity items with memoization
	const activityItems = useMemo(() => {
		if (!data) return initialData;
		return data.pages.flat();
	}, [data, initialData]);

	// Error state
	if (isError) {
		return <ClientError message={t("ERROR")} />;
	}

	// Empty state
	if (activityItems.length === 0) {
		return (
			<div className="flex flex-col gap-4 sm:gap-6 w-full mt-16 sm:mt-40 items-center">
				<div className="text-primary">
					<Activity size={66} />
				</div>
				<p className="font-semibold text-lg sm:text-2xl max-w-3xl text-center">
					{t("NO_DATA")}
				</p>
			</div>
		);
	}

	// Optimized rendering with virtualization hints
	return (
		<div className="space-y-2">
			{activityItems.map((activityItem, i) => {
				const isLast = i === activityItems.length - 1;
				// Apply ref only to last item
				if (isLast) {
					return (
						<div key={activityItem.id} ref={ref}>
							<HomeRecentActivityItem activityItem={activityItem} />
						</div>
					);
				}

				return (
					<HomeRecentActivityItem
						key={activityItem.id}
						activityItem={activityItem}
					/>
				);
			})}

			{/* Loading indicator */}
			{isFetchingNextPage && (
				<div className="flex justify-center items-center h-10 py-4">
					<LoadingState />
				</div>
			)}
		</div>
	);
};
