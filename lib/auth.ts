import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession, NextAuthOptions } from "next-auth";
import { db } from "./db";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { generateFromEmail } from "unique-username-generator";

export const authOptions: NextAuthOptions = {
	debug: true,
	session: {
		strategy: "jwt",
	},
	pages: {
		error: "/sign-in",
		signIn: "/sign-in",
	},
	adapter: PrismaAdapter(db) as Adapter,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			//@ts-ignore
			async profile(profile) {
				const username = generateFromEmail(profile.email, 5);
				return {
					id: profile.sub,
					username,
					name: profile.given_name ? profile.given_name : profile.name,
					surname: profile.family_name ? profile.family_name : "",
					email: profile.email,
					image: profile.picture,
				};
			},
		}),
		GithubProvider({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			profile(profile) {
				const username = generateFromEmail(profile.email || profile.login, 5);
				const fullName = (profile.name || "").split(" ");
				return {
					id: profile.id.toString(),
					username: profile.login || username,
					name: fullName[0] || profile.login,
					surname: fullName[1] || "",
					email: profile.email,
					image: profile.avatar_url,
					completedOnboarding: false,
				};
			},
		}),
		AppleProvider({
			clientId: process.env.APPLE_CLIENT_ID!,
			clientSecret: process.env.APPLE_CLIENT_SECRET!,
		}),
		CredentialsProvider({
			name: "credentials",
			credentials: {
				username: { label: "Username", type: "text", placeholder: "Username" },
				email: { label: "Email", type: "text", placeholder: "Email" },
				password: {
					label: "Password",
					type: "password",
					placeholder: "Password",
				},
			},
			//@ts-ignore
			async authorize(credentials, req) {
				if (!credentials?.email || !credentials.password) {
					throw new Error("Please enter email and password.");
				}

				const user = await db.user.findUnique({
					where: {
						email: credentials.email,
					},
				});

				if (!user || !user?.hashedPassword) {
					throw new Error("User was not found, Please enter valid email");
				}
				const passwordMatch = await bcryptjs.compare(
					credentials.password,
					user.hashedPassword,
				);

				if (!passwordMatch) {
					throw new Error(
						"The entered password is incorrect, please enter the correct one.",
					);
				}

				return user;
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.image = token.picture;
				//@ts-ignore
				session.user.username = token.username;
				//@ts-ignore
				session.user.surname = token.surname;
				session.user.completedOnboarding = !!token.completedOnboarding;
			}

			const user = await db.user.findUnique({
				where: {
					id: token.id,
				},
			});

			if (user) {
				session.user.image = user.image;
				session.user.completedOnboarding = user.completedOnboarding;
				session.user.username = user.username;
			}

			return session;
		},
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id;
				token.username = user.username;
				token.surname = user.surname;
				token.completedOnboarding = user.completedOnboarding;
			}

			// Ensure we're getting the latest user data
			const dbUser = await db.user.findFirst({
				where: {
					email: token.email!,
				},
			});

			if (dbUser) {
				return {
					id: dbUser.id,
					username: dbUser.username,
					email: dbUser.email,
					name: dbUser.name,
					surname: dbUser.surname,
					picture: dbUser.image,
					completedOnboarding: dbUser.completedOnboarding,
				};
			}

			return token;
		},
	},
};

export const getAuthSession = () => getServerSession(authOptions);
