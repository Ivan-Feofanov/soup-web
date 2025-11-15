import { definePageMetaTags } from 'svelte-meta-tags';
import type { Recipe } from '$lib/types';
import { buildCloudinaryUrl } from '$lib/cloudinary';

export const getMetaDataFromRecipe = (recipe: Recipe) => {
	const imgUrl = buildCloudinaryUrl(recipe.image || '', {
		width: 1200,
		height: 630,
		watermark: true
	});
	const recipeData = {
		title: recipe.title!,
		description: recipe.description!,
		image: imgUrl
	};
	return definePageMetaTags({
		title: recipeData.title,
		description: recipeData.description,
		openGraph: {
			title: recipeData.title,
			description: recipeData.description,
			images: [
				{
					url: imgUrl,
					width: 1200,
					height: 630,
					alt: recipeData.title
				}
			]
		},
		twitter: {
			title: recipeData.title,
			description: recipeData.description,
			image: imgUrl,
			imageAlt: recipeData.title
		}
	});
};
