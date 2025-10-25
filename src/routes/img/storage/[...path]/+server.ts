import type { RequestEvent } from '@sveltejs/kit';

export const GET = async ({ params, platform }: RequestEvent) => {
	const path = params.path!;
	if (!platform?.env?.IMAGES) {
		return new Response(null, { status: 500 });
	}
	const file = await platform.env.IMAGES.get(path);
	if (!file) {
		return new Response(null, { status: 404 });
	}

	return new Response(file.body as BodyInit, {
		headers: {
			'Content-Type': file.httpMetadata?.contentType ?? 'application/octet-stream',
			// Max age tells Cloudflare to cache images for 1 hour
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
