import { ValidationError } from '$lib/server/base';
import type { ErrorResponse } from '$lib/types';

export enum HttpStatus {
	OK = 200,
	CREATED = 201,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	INTERNAL_SERVER_ERROR = 500,
	SERVICE_UNAVAILABLE = 503
}

export const handleErrorResponse = async (response: Response) => {
	let errorData: ErrorResponse;
	try {
		errorData = await response.json();
		console.error('API request failed:', errorData);
	} catch (e) {
		console.error('Failed to parse error response:', e);
		const errorString = `API request failed: ${response.statusText}`;
		throw new Error(`API request failed: ${errorString}`);
	}
	if (response.status === HttpStatus.BAD_REQUEST && errorData?.errors) {
		throw new ValidationError(errorData.message, errorData.errors);
	}
	throw new Error(errorData.message);
};
