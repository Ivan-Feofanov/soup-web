import {
	CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET
} from '$env/static/private';
import type { UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';

export class ImagesAPI {
	constructor() {
		cloudinary.config({
			cloud_name: CLOUDINARY_CLOUD_NAME,
			api_key: CLOUDINARY_API_KEY,
			api_secret: CLOUDINARY_API_SECRET
		});
	}

	async create(file: File) {
		const fileData = await file.bytes();

		try {
			const uploadResult: UploadApiResponse | undefined = await new Promise((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{
							folder: 'kitchen',
							resource_type: 'image'
						},
						(error, uploadResult) => {
							if (error) {
								return reject(error);
							}
							return resolve(uploadResult);
						}
					)
					.end(fileData);
			});
			return uploadResult?.public_id;
		} catch (e) {
			console.error(e);
			throw new Error(`Failed to upload image: ${e}`);
		}
	}

	async delete(imageKey: string) {
		try {
			await cloudinary.uploader.destroy(imageKey);
		} catch (e) {
			console.error(e);
			throw new Error(`Failed to delete image: ${e}`);
		}
	}
}
