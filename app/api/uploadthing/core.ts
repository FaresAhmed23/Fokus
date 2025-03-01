import { getToken } from "next-auth/jwt";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
	imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 2 } })
		.middleware(async (req) => {
			const user = await getToken(req);
			if (!user) throw new Error("Unauthorized");
			return { userId: user.id };
		})
		.onUploadComplete(async ({ file, metadata }) => {
			// Return file data to be used on the client
			return { url: file.url };
		}),
	addToChatFile: f({
		pdf: { maxFileSize: "32MB", maxFileCount: 5 },
		image: { maxFileSize: "16MB", maxFileCount: 5 },
	})
		.middleware(async (req) => {
			const user = await getToken(req);
			if (!user) throw new Error("Unauthorized");
			return { userId: user.id };
		})
		.onUploadComplete(async ({ file, metadata }) => {
			// Return file data to be used on the client
			return { url: file.url };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
