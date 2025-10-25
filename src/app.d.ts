// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { R2Bucket } from '@cloudflare/workers-types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('$lib/types').User;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				IMAGES: R2Bucket;
			};
		}
	}
}

export {};
