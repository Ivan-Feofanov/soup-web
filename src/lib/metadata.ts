import { definePageMetaTags } from 'svelte-meta-tags';
import type { Recipe } from '$lib/types';
import { buildCloudinaryUrl } from '$lib/cloudinary';

export const getMetaDataFromRecipe = (recipe: Recipe) => {
	return definePageMetaTags({
		title: recipe.title,
		description: recipe.description,
		openGraph: {
			title: recipe.title,
			description: recipe.description,
			images: [
				{
					url: buildCloudinaryUrl(recipe.image || '', { width: 1200, height: 630 }),
					width: 1200,
					height: 630,
					alt: recipe.title
				}
			]
		},
		twitter: {
			title: recipe.title,
			description: recipe.description,
			image: buildCloudinaryUrl(recipe.image || '', { width: 1200, height: 630 }),
			imageAlt: recipe.title
		}
	});
};
