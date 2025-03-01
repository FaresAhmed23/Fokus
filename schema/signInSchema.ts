import { z } from "zod";

// Create a password validator factory
export function createPasswordValidator(messages: {
	min: string;
	uppercase: string;
	lowercase: string;
	digit: string;
}) {
	return z
		.string()
		.refine((password) => password.length >= 6, {
			message: messages.min,
		})
		.refine((password) => /[A-Z]/.test(password), {
			message: messages.uppercase,
		})
		.refine((password) => /[a-z]/.test(password), {
			message: messages.lowercase,
		})
		.refine((password) => /\d/.test(password), {
			message: messages.digit,
		});
}

// Create a sign-in schema factory
export function createSignInSchema(messages: {
	invalidEmail: string;
	passwordMin: string;
}) {
	return z.object({
		email: z.string().email(messages.invalidEmail),
		password: z.string().min(10, messages.passwordMin),
	});
}

// Types will remain the same
export type SignInSchema = z.infer<ReturnType<typeof createSignInSchema>>;

// Default password validator with message keys
export const getDefaultPasswordValidator = () =>
	createPasswordValidator({
		min: "SCHEMA.PASSWORD.MIN",
		uppercase: "SCHEMA.PASSWORD.UPPERCASE",
		lowercase: "SCHEMA.PASSWORD.LOWERCASE",
		digit: "SCHEMA.PASSWORD.DIGIT",
	});

export const getDefaultSignInSchema = () =>
	createSignInSchema({
		invalidEmail: "Please enter a valid email",
		passwordMin: "Password must be at least 10 characters",
	});

// For backward compatibility
export const password = getDefaultPasswordValidator();
export const signInSchema = getDefaultSignInSchema();
