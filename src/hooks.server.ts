import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Intercept Set-Cookie headers and add Domain attribute for cross-subdomain auth
	const setCookie = response.headers.get('set-cookie');
	if (setCookie && setCookie.includes('sessionid=')) {
		// Check if the cookie already has a Domain attribute
		if (!setCookie.includes('Domain=')) {
			// Add Domain=.feofanov.dev to the sessionid cookie
			const modifiedCookie = setCookie + '; Domain=.feofanov.dev';

			// Create a new response with the modified Set-Cookie header
			const newResponse = new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers
			});

			newResponse.headers.set('set-cookie', modifiedCookie);
			return newResponse;
		}
	}

	return response;
};
