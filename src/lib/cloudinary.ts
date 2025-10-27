import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

/**
 * Build a Cloudinary URL from a public_id
 * @param publicId - The Cloudinary public_id (e.g., "kitchen/abc123")
 * @param options - Optional transformations
 * @returns Full Cloudinary URL
 */
export function buildCloudinaryUrl(
	publicId: string,
	options?: {
		width?: number;
		height?: number;
		crop?: string;
		quality?: string | number;
		format?: string;
	}
): string {
	const cloudName = PUBLIC_CLOUDINARY_CLOUD_NAME;
	const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

	// Build transformation string
	const transformations: string[] = [];

	if (options?.width) transformations.push(`w_${options.width}`);
	if (options?.height) transformations.push(`h_${options.height}`);
	if (options?.crop) transformations.push(`c_${options.crop}`);
	if (options?.quality) transformations.push(`q_${options.quality}`);
	if (options?.format) transformations.push(`f_${options.format}`);

	const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';

	return `${baseUrl}/${transformString}${publicId}`;
}
