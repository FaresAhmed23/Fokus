import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
	size?: number;
	className?: string;
	hasLink?: boolean;
}

export const AppTitle = ({ className, hasLink }: Props) => {
	return (
		<>
			{hasLink ? (
				<Link
					href={"/dashboard"}
					className={cn(
						"flex justify-center items-center gap-2 text-2xl bg-red-500 relative z-10",
						className,
					)}
				>
					<h1>
						F<span className="text-primary">O</span>k
						<span className="text-primary">U</span>s
					</h1>
				</Link>
			) : (
				<div
					className={cn(
						"flex justify-center items-center gap-2 text-2xl",
						className,
					)}
				>
					<h1>
						F<span className="text-primary">O</span>k
						<span className="text-primary">U</span>s
					</h1>
				</div>
			)}
		</>
	);
};
