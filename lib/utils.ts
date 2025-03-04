import { clsx, type ClassValue } from "clsx";
import { CalendarDays, Clock, Home, Star, User } from "lucide-react";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import { ExtendedMessage } from "@/types/extended";

/**
 * Combines class names with Tailwind's merge utility
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

/**
 * Sound effect file paths
 */
export const pathsToSoundEffects = {
	ANALOG: "/music/analog.mp3",
	BELL: "/music/bell.mp3",
	BIRD: "/music/bird.mp3",
	CHURCH_BELL: "/music/churchBell.mp3",
	DIGITAL: "/music/digital.mp3",
	FANCY: "/music/fancy.mp3",
} as const;

export type SoundEffectKey = keyof typeof pathsToSoundEffects;

/**
 * Top sidebar navigation links configuration
 */
export interface SidebarLink {
	href: string;
	Icon: React.ElementType;
	hoverTextKey: string;
	include?: string;
}

export const topSidebarLinks: SidebarLink[] = [
	{
		href: "/dashboard",
		Icon: Home,
		hoverTextKey: "HOME_HOVER",
	},
	{
		href: "/dashboard/pomodoro",
		include: "/dashboard/pomodoro",
		Icon: Clock,
		hoverTextKey: "POMODORO_HOVER",
	},
	{
		href: "/dashboard/calendar",
		Icon: CalendarDays,
		hoverTextKey: "CALENDAR_HOVER",
	},
	{
		href: "/dashboard/starred",
		Icon: Star,
		hoverTextKey: "STARRED_HOVER",
	},
	{
		href: "/dashboard/assigned-to-me",
		Icon: User,
		hoverTextKey: "ASSIGNED_TO_ME_HOVER",
	},
];

/**
 * Generates a 5x7 matrix representing a month's calendar
 * @param month - Zero-indexed month (0 = January)
 * @returns A 5x7 matrix of dayjs objects
 */
export const getMonth = (month = dayjs().month()): dayjs.Dayjs[][] => {
	const year = dayjs().year();
	const firstDayOfMonth = dayjs(new Date(year, month, 1)).day();

	let currentMonthCount = 1 - firstDayOfMonth;

	// Create 5x7 matrix for the calendar
	const daysMatrix = new Array(5).fill(null).map(() => {
		return new Array(7).fill(null).map(() => {
			currentMonthCount++;
			return dayjs(new Date(year, month, currentMonthCount));
		});
	});

	// Handle edge case for months starting on Monday
	if (firstDayOfMonth === 1) {
		const firstWeek = daysMatrix[0];
		const previousMonth = month === 0 ? 11 : month - 1;
		const previousYear = month === 0 ? year - 1 : year;
		const lastDayOfPreviousMonth = dayjs(
			new Date(previousYear, previousMonth + 1, 0),
		).date();

		for (let i = 7 - firstWeek.length; i > 0; i--) {
			const day = lastDayOfPreviousMonth - i + 1;
			firstWeek.unshift(dayjs(new Date(previousYear, previousMonth, day)));
		}
	}

	return daysMatrix;
};

/**
 * Smoothly scrolls to an element by ID
 * @param elementId - The ID of the element to scroll to
 */
export const scrollToHash = (elementId: string): void => {
	const element = document.getElementById(elementId);

	if (element) {
		element.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "nearest",
		});
	}
};

/**
 * Determines whether to show user information for a message
 * based on previous messages and time differences
 *
 * @param messages - Array of messages
 * @param messageId - ID of the current message
 * @returns boolean indicating whether to show user info
 */
export const showUserInformation = (
	messages: ExtendedMessage[],
	messageId: string,
): boolean => {
	const currentIndex = messages.findIndex(
		(message) => message.id === messageId,
	);

	// First message or message not found
	if (currentIndex <= 0) {
		return true;
	}

	const prevMessage = messages[currentIndex - 1];
	const currentMessage = messages[currentIndex];

	// Different senders
	if (prevMessage.sender.id !== currentMessage.sender.id) {
		return true;
	}

	// Previous message has additional resources
	if (prevMessage.additionalResources.length > 0) {
		return true;
	}

	// Time difference greater than 60 seconds
	const prevMessageTime = dayjs(prevMessage.createdAt);
	const currentMessageTime = dayjs(currentMessage.createdAt);
	const timeDifference = currentMessageTime.diff(prevMessageTime, "seconds");

	return timeDifference > 60;
};
