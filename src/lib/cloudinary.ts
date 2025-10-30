import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

/**
 * Build a Cloudinary URL from a public_id
 * @param publicId - The Cloudinary public_id (e.g., "kitchen/abc123")
 * @param options - Optional transformations
 * @returns Full Cloudinary URL
 */

const watermarkOptions = {
	overlay: 'logo_classic_watermark',
	crop: 'scale',
	width: 200,
	effect: 'mask',
	gravity: 'south_east',
	x: 10,
	y: 10,
	angle: -15,
	opacity: 50
};

export function buildCloudinaryUrl(
	publicId: string,
	options?: {
		width?: number;
		height?: number;
		crop?: string;
		quality?: string | number;
		format?: string;
		watermark?: boolean;
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

	if (options?.watermark) {
		const wmString = `c_${options.crop || 'fill'}/l_${watermarkOptions.overlay}/c_${watermarkOptions.crop},w_${watermarkOptions.width}/e_${watermarkOptions.effect},fl_layer_apply,g_${watermarkOptions.gravity},x_${watermarkOptions.x},y_${watermarkOptions.y},a_${watermarkOptions.angle},o_${watermarkOptions.opacity}`;
		transformations.push(wmString);
	}
	const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';

	return `${baseUrl}/${transformString}${publicId}`;
}
