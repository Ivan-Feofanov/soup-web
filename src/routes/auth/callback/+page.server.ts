// src/routes/auth/callback/google/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_API_URL, AUTH_REDIRECT_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ url, cookies }) => {
	// 1. Получаем `code` из параметров URL, который добавил Google
	const code = url.searchParams.get('code');

	if (!code) {
		// Если кода нет, что-то пошло не так
		throw redirect(303, '/login?error=auth_failed');
	}

	// 2. Отправляем этот code на наш бэкенд
	try {
		const response = await fetch(`${BACKEND_API_URL}/api/auth/login/google-oauth2/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				code: code,
				redirect_uri: AUTH_REDIRECT_URL
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Backend error:', errorData);
			throw new Error('Failed to exchange code for tokens');
		}

		const data = await response.json();
		const { access, refresh, user } = data;

		// 3. Устанавливаем refresh токен в безопасный HttpOnly cookie
		// Этот cookie будет автоматически отправляться браузером на ваш бэкенд,
		// но JavaScript на клиенте не сможет его прочитать.
		cookies.set('refresh_token', refresh, {
			path: '/',
			httpOnly: true, // <-- Защита от XSS атак
			secure: process.env.NODE_ENV === 'production', // В продакшене использовать https
			maxAge: 60 * 60 * 24 * 7 // 7 дней
		});

		// 4. Передаем access токен и данные пользователя на клиентскую часть
		// для немедленного использования.
		return {
			accessToken: access,
			user: {
				uid: user.uid,
				email: user.email,
				firstName: user.first_name,
				lastName: user.last_name
			}
		};
	} catch (error) {
		console.error('Callback error:', error);
		throw redirect(303, '/login?error=unexpected_error');
	}
};
