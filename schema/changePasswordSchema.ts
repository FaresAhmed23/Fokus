import { z } from "zod";
import {
	createPasswordValidator,
	getDefaultPasswordValidator,
} from "./signInSchema";

// Create a change password schema factory
export function createChangePasswordSchema(
	passwordValidator: z.ZodEffects<z.ZodString, string, string>,
	messages: {
		passwordsNotMatch: string;
		sameAsOld: string;
	},
) {
	return z
		.object({
			current_password: passwordValidator,
			new_password: passwordValidator,
			repeat_password: z.string(),
		})
		.refine((data) => data.new_password === data.repeat_password, {
			message: messages.passwordsNotMatch,
			path: ["repeat_password"],
		})
		.refine((data) => data.new_password !== data.current_password, {
			message: messages.sameAsOld,
			path: ["new_password"],
		});
}

// Type will remain the same
export type ChangePasswordSchema = z.infer<
	ReturnType<typeof createChangePasswordSchema>
>;

// Default change password schema with message keys
export const getDefaultChangePasswordSchema = () =>
	createChangePasswordSchema(getDefaultPasswordValidator(), {
		passwordsNotMatch: "SCHEMA.PASSWORD_NOT_THE_SAME",
		sameAsOld: "SCHEMA.PASSWORD_SAME_AS_OLD",
	});

// For backward compatibility
export const changePasswordSchema = getDefaultChangePasswordSchema();
