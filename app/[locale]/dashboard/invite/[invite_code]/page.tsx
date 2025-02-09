import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { db } from "@/lib/db";
import { NotifyType } from "@prisma/client";
import { redirect } from "@/navigation";
import { type SearchParams } from "@/types";

interface PageProps {
	params: {
		invite_code: string;
		locale: string; // Add locale to match dynamic route
	};
	searchParams: SearchParams; // Use defined type for search params
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
		`/dashboard/invite/${invite_code}`,
	);

	// Validate role with type guard
	const role = searchParams.role;
	const validRoles = ["admin", "editor", "viewer"];
	if (!validRoles.includes(role as string)) {
		redirect("/dashboard/errors?error=wrong-role");
		return null;
	}

	const shareCode = searchParams.shareCode;
	if (!shareCode || !invite_code) {
		redirect("/dashboard/errors?error=no-data");
		return null;
	}

	// Type-safe invite code validation
	//@ts-ignore
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
		redirect("/dashboard/errors?error=outdated-invite-code");
		return null;
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
		redirect(`/dashboard/workspace/${existingWorkspace.id}`);
		return null;
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
			userRole: roleMap[role as keyof typeof roleMap],
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

	redirect(`/dashboard/workspace/${inviteCodeValid.id}`);
	return null;
};

export default Workspace;
