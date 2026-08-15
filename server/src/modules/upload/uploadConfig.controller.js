import {
  getAllUploadConfigsService,
  getLeastLoadedUploadConfigService,
  createUploadConfigService,
  updateUploadConfigService,
  deleteUploadConfigService,
  maskUploadUrl,
} from './uploadConfig.service.js';
import { uploadImageToCloudinaryService } from './upload.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';

export const getUploadConfigs = async (req, res, next) => {
  try {
    const result = await getAllUploadConfigsService();
    res.status(200).json(new ApiResponse(200, result, 'Upload configurations retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getLeastLoadedUploadConfig = async (req, res, next) => {
  try {
    const result = await getLeastLoadedUploadConfigService();
    const doc = result.toJSON ? result.toJSON() : { ...result };
    doc.uploadUrl = maskUploadUrl(doc.uploadUrl);
    res.status(200).json(new ApiResponse(200, doc, 'Least loaded active upload config retrieved'));
  } catch (error) {
    next(error);
  }
};

export const createUploadConfig = async (req, res, next) => {
  try {
    const result = await createUploadConfigService(req.body);
    res.status(201).json(new ApiResponse(201, result, 'Upload configuration created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateUploadConfig = async (req, res, next) => {
  try {
    const result = await updateUploadConfigService(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, result, 'Upload configuration updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteUploadConfig = async (req, res, next) => {
  try {
    const result = await deleteUploadConfigService(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Upload configuration deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No image file provided');
    }
    const result = await uploadImageToCloudinaryService(req.file.buffer, req.file.originalname);
    res.status(200).json(new ApiResponse(200, result, 'Image uploaded successfully'));
  } catch (error) {
    next(error);
  }
};
