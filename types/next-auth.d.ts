// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			username: string;
			completedOnboarding: boolean;
			surname: string;
		} & DefaultSession["user"];
	}

	interface User {
		username: string;
		completedOnboarding: boolean;
		surname: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		username: string;
		completedOnboarding: boolean;
		surname: string;
	}
}
