import type { LayoutServerLoad } from './$types';

import { UserAPI } from '$lib/server/user';
import { defineBaseMetaTags } from 'svelte-meta-tags';
import { buildCloudinaryUrl } from '$lib/cloudinary';

export const load: LayoutServerLoad = async ({ url, cookies, fetch }) => {
	const baseMetaTags = defineBaseMetaTags({
		title: "My Father's Soup",
		titleTemplate: "%s | My Father's Soup",
		description: 'Probably the best community cookbook ever!',
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			type: 'website',
			url: new URL(url.pathname, url.origin).href,
			title: "My Father's Soup",
			description: 'Probably the best community cookbook ever!',
			images: [
				{
					url: buildCloudinaryUrl(`assets/logo_classic_image_vdtbco`, { width: 800, height: 600 }),
					width: 800,
					height: 600,
					alt: "My Father's Soup logo"
				}
			],
			siteName: "My Father's Soup"
		},
		twitter: {
			creator: '@feofanov',
			site: '@feofanov',
			cardType: 'summary_large_image',
			title: "My Father's Soup",
			description: 'Probably the best community cookbook ever!',
			image: buildCloudinaryUrl(`assets/logo_classic_image_vdtbco`, { width: 800, height: 600 }),
			imageAlt: "My Father's Soup logo"
		}
	});
	return {
		baseMetaTags: baseMetaTags.baseMetaTags,
		user: await new UserAPI(cookies, fetch).GetMe()
	};
};
