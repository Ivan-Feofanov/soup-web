/**
 * Token storage and management for JWT authentication
 * 
 * Strategy:
 * - Access tokens: Stored in memory (not localStorage to prevent XSS)
 * - Refresh tokens: Stored in HttpOnly cookies (secure, can't be accessed by JS)
 */

// In-memory storage for access token (cleared on page refresh)
let accessToken: string | null = null;

/**
 * Store access token in memory
 */
export function setAccessToken(token: string) {
	accessToken = token;
}

/**
 * Get access token from memory
 */
export function getAccessToken(): string | null {
	return accessToken;
}

/**
 * Clear access token from memory
 */
export function clearAccessToken() {
	accessToken = null;
}

/**
 * Check if user is authenticated (has access token)
 */
export function isAuthenticated(): boolean {
	return accessToken !== null;
}

