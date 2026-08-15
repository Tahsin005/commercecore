import { v2 as cloudinary } from 'cloudinary';
import { getLeastLoadedUploadConfigService } from './uploadConfig.service.js';
import ApiError from '../../utils/ApiError.js';

export const uploadImageToCloudinaryService = async (fileBuffer, originalname = '') => {
  if (!fileBuffer || !fileBuffer.length) {
    throw new ApiError(400, 'No image file provided');
  }

  // pick the active Cloudinary account with the lowest load & increment load counter
  const config = await getLeastLoadedUploadConfigService();

  const match = config.uploadUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i);
  if (!match) {
    throw new ApiError(400, 'Invalid Cloudinary connection URL format in upload configuration');
  }

  const [, apiKey, apiSecret, cloudName] = match;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'commercecore',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError(500, `Cloudinary upload failed: ${error.message || 'Unknown error'}`));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          configName: config.name || 'Default Account',
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};
