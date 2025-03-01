import { HomeRecentActivity } from "@/types/extended";
import { Card, CardContent } from "../ui/card";
import { ReadOnlyEmoji } from "../common/ReadOnlyEmoji";
import { Link } from "@/navigation"; // Using your custom Link component
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import { UserHoverInfo } from "../common/UserHoverInfoCard";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { StarSvg } from "../common/StarSvg";

interface Props {
	activityItem: HomeRecentActivity;
}

export const HomeRecentActivityItem = ({
	activityItem: {
		emoji,
		link,
		title,
		type,
		updated,
		workspaceId,
		workspaceName,
		starred,
	},
}: Props) => {
	const format = useFormatter();
	const dateTime = new Date(updated.at);
	const now = new Date();

	const t = useTranslations("STARRED");
	const c = useTranslations("COMMON");

	const itemTypeSentence = useMemo(() => {
		return type === "mindMap"
			? c("EDITED_ITEM_SENTENCE.MIND_MAP")
			: c("EDITED_ITEM_SENTENCE.TASK");
	}, [type]);

	return (
		<Card className="bg-background border-none hover:bg-accent transition-colors duration-200 p-2">
			<Link href={link} className="block">
				<CardContent className="flex w-full justify-between sm:items-center p-2 sm:p-2 pt-0">
					<div className="flex flex-row sm:gap-4 gap-2 w-full">
						<ReadOnlyEmoji
							className="sm:h-16 sm:w-16 h-12 w-12"
							selectedEmoji={emoji}
						/>
						<div className="w-full">
							<div className="flex items-center">
								<h2 className="text-lg sm:text-2xl font-semibold">
									{!title && type === "mindMap" && t("DEFAULT_NAME.MIND_MAP")}
									{!title && type === "task" && t("DEFAULT_NAME.TASK")}
									{title && title}
								</h2>
								{starred && <StarSvg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
							</div>
							{updated.by && (
								<div className="flex flex-col md:flex-row md:items-center md:gap-1">
									<p className="text-muted-foreground">{itemTypeSentence}</p>{" "}
									{format.relativeTime(dateTime, now)}{" "}
									{c("EDITED_ITEM_SENTENCE.BY")}
									<div className="flex items-center gap-1">
										<UserHoverInfo className="px-0" user={updated.by} />
										{/* Stop propagation on this link to prevent nesting issues */}
										<span>
											{c("EDITED_ITEM_SENTENCE.IN")}{" "}
											<span
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													window.location.href = `/dashboard/workspace/${workspaceId}`;
												}}
												className={cn(
													`${buttonVariants({
														variant: "link",
													})} px-0 cursor-pointer`,
												)}
											>
												{workspaceName}
											</span>
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Link>
		</Card>
	);
};
