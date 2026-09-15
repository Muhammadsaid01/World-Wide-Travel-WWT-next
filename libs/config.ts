export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '';

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? '';

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all required fields!',
	error4: 'Message is empty!',
	error5: 'Only JPEG, JPG, and PNG images are allowed!',
	error6: 'Unauthorized access!',
	error7: 'You do not have permission to perform this action.',
} as const;

export const ALLOWED_IMAGE_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
] as const;