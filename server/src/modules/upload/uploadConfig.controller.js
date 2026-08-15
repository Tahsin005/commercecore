import {
  getAllUploadConfigsService,
  getLeastLoadedUploadConfigService,
  createUploadConfigService,
  updateUploadConfigService,
  deleteUploadConfigService,
} from './uploadConfig.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

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
    res.status(200).json(new ApiResponse(200, result, 'Least loaded active upload config retrieved'));
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

import { uploadImageToCloudinaryService } from './upload.service.js';

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
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const result = await uploadImageToCloudinaryService(req.file.buffer, req.file.originalname);
    res.status(200).json(new ApiResponse(200, result, 'Image uploaded successfully'));
  } catch (error) {
    next(error);
  }
};
