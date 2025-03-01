import { z } from "zod";

// Create a factory function that takes translations
export function createAdditionalUserInfoSchema(messages: {
	requiredField: string;
	specialChars: string;
}) {
	return z.object({
		name: z
			.string()
			.min(1, { message: messages.requiredField })
			.refine((username) => /^[a-zA-Z0-9]+$/.test(username), {
				message: messages.specialChars,
			})
			.optional(),

		surname: z
			.string()
			.min(1, { message: messages.requiredField })
			.refine((username) => /^[a-zA-Z0-9]+$/.test(username), {
				message: messages.specialChars,
			})
			.optional(),
	});
}

export type AdditionalUserInfoFirstPart = z.infer<
	ReturnType<typeof createAdditionalUserInfoSchema>
>;
