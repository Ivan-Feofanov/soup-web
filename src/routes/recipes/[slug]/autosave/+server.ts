import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { KitchenAPI } from '$lib/server/kitchen';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { recipeDraftSchema } from '$lib/schemes';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const data = await request.json();

		// Validate the draft data
		const form = await superValidate(data, zod4(recipeDraftSchema));

		if (!form.valid) {
			console.error('Validation errors:', form.errors);
			return json({ success: false, errors: form.errors }, { status: 400 });
		}

		// Update the draft
		const kitchenApi = new KitchenAPI(cookies, fetch);
		await kitchenApi.updateDraft(form.data.uid, form.data);

		return json({ success: true });
	} catch (err) {
		console.error('Auto-save failed:', err);
		return error(500, 'Failed to save draft');
	}
};
