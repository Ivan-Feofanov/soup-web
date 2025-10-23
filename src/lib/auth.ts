import { GOOGLE_CLIENT_ID, AUTH_REDIRECT_URL } from '$env/static/private';

export const getGoogleAuthUrl = () => {
	const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
	googleAuthUrl.searchParams.set('redirect_uri', AUTH_REDIRECT_URL);
	googleAuthUrl.searchParams.set('response_type', 'code');
	googleAuthUrl.searchParams.set(
		'scope',
		'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
	);
	googleAuthUrl.searchParams.set('access_type', 'offline');
	return googleAuthUrl.toString();
};
