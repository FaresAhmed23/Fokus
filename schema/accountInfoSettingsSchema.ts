import { z } from "zod";

// Create a factory function that takes translations
export function createAccountInfoSettingsSchema(messages: {
	usernameShort: string;
	specialChars: string;
	languageRequired: string;
}) {
	return z.object({
		username: z
			.string()
			.min(2, { message: messages.usernameShort })
			.refine((username) => /^[a-zA-Z0-9]+$/.test(username), {
				message: messages.specialChars,
			})
			.optional(),
		language: z.string({
			required_error: messages.languageRequired,
		}),
		name: z.string().optional(),
		surname: z.string().optional(),
	});
}

// Type will remain the same regardless of messages
export type AccountInfoSettingsSchema = z.infer<
	ReturnType<typeof createAccountInfoSettingsSchema>
>;

// Export a function that creates the schema with default message keys
// This maintains backward compatibility with existing code
export const getDefaultAccountInfoSettingsSchema = () =>
	createAccountInfoSettingsSchema({
		usernameShort: "SCHEMA.USERNAME.SHORT",
		specialChars: "SCHEMA.USERNAME.SPECIAL_CHARS",
		languageRequired: "SCHEMA.LANGUAGE",
	});
