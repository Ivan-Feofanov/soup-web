import type { User } from '$lib/types';
import { writable, get, derived } from 'svelte/store';

interface AuthState {
	user: User | null;
	accessToken: string | null;
}

function createAuthStore() {
	const { subscribe, set } = writable<AuthState>({
		user: null,
		accessToken: null
	});

	return {
		subscribe,
		login: (user: User, accessToken: string | null = null) => {
			console.log('Logging in user:', user);
			set({ user, accessToken });
		},
		logout: () => {
			set({ user: null, accessToken: null });
			// Также нужно будет удалить cookie на сервере
		},
		getAccessToken: () => {
			return get({ subscribe }).accessToken;
		}
	};
}

export const auth = createAuthStore();
export const userStore = derived(auth, (s) => s.user);
