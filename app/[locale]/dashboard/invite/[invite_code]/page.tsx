import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { db } from "@/lib/db";
import { NotifyType } from "@prisma/client";
import { redirect } from "next/navigation"; // Changed to server-side redirect
import { type SearchParams } from "@/types";

interface PageProps {
	params: {
		invite_code: string;
		locale: string;
	};
	searchParams: SearchParams;
}

interface InviteCodeValidWhere {
	inviteCode: string;
	adminCode?: string;
	readOnlyCode?: string;
	canEditCode?: string;
}

const Workspace = async ({ params, searchParams }: PageProps) => {
	const { invite_code, locale } = params;
	const session = await checkIfUserCompletedOnboarding(
		`/${locale}/dashboard/invite/${invite_code}`,
	);

	// Validate role with type guard
	const role = searchParams.role;
	const validRoles = ["admin", "editor", "viewer"] as const;

	if (!role || !validRoles.includes(role as (typeof validRoles)[number])) {
		redirect(`/${locale}/dashboard/errors?error=wrong-role`);
	}

	const shareCode = searchParams.shareCode;
	if (!shareCode || !invite_code) {
		redirect(`/${locale}/dashboard/errors?error=no-data`);
	}

	// Type-safe invite code validation
	const inviteCodeValidWhere: InviteCodeValidWhere = {
		inviteCode: invite_code,
		...(role === "admin" && { adminCode: shareCode }),
		...(role === "editor" && { canEditCode: shareCode }),
		...(role === "viewer" && { readOnlyCode: shareCode }),
	};

	const inviteCodeValid = await db.workspace.findUnique({
		where: inviteCodeValidWhere,
	});

	if (!inviteCodeValid) {
		redirect(`/${locale}/dashboard/errors?error=outdated-invite-code`);
	}

	// Existing workspace check
	const existingWorkspace = await db.workspace.findFirst({
		where: {
			inviteCode: invite_code,
			subscribers: {
				some: {
					userId: session.user.id,
				},
			},
		},
	});

	if (existingWorkspace) {
		redirect(`/${locale}/dashboard/workspace/${existingWorkspace.id}`);
	}

	// Type-safe role mapping
	const roleMap = {
		admin: "ADMIN",
		editor: "CAN_EDIT",
		viewer: "READ_ONLY",
	} as const;

	await db.subscription.create({
		data: {
			userId: session.user.id,
			workspaceId: inviteCodeValid.id,
			userRole: roleMap[role],
		},
	});

	// Create notifications
	const workspaceUsers = await db.subscription.findMany({
		where: { workspaceId: inviteCodeValid.id },
		select: { userId: true },
	});

	await db.notification.createMany({
		data: workspaceUsers.map((user) => ({
			notifyCreatorId: session.user.id,
			userId: user.userId,
			workspaceId: inviteCodeValid.id,
			notifyType: NotifyType.NEW_USER_IN_WORKSPACE,
		})),
	});

	redirect(`/${locale}/dashboard/workspace/${inviteCodeValid.id}`);
};

export default Workspace;
