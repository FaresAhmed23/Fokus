import Link from "next/link";

export default async function NotFound() {
	return (
		<div className="min-h-dvh flex justify-center items-center">
			<h2 className="text-5xl font-semibold">Not Found</h2>
			<p className="text-2xl">Could not find requested resource</p>
			<p className="text-2xl">
				View <Link href={"/"}>Home Page</Link>
			</p>
		</div>
	);
}
