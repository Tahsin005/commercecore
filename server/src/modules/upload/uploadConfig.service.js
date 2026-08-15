import mongoose from 'mongoose';
import UploadConfig from './uploadConfig.model.js';
import ApiError from '../../utils/ApiError.js';

export const getAllUploadConfigsService = async () => {
  const configs = await UploadConfig.find({}).sort({ load: 1, createdAt: -1 });
  
  const stats = configs.reduce(
    (acc, cfg) => {
      acc.totalConfigs += 1;
      if (cfg.isActive) acc.activeConfigs += 1;
      acc.totalLoad += cfg.load || 0;
      return acc;
    },
    { totalConfigs: 0, activeConfigs: 0, totalLoad: 0 }
  );

  return {
    configs,
    stats,
  };
};

export const getLeastLoadedUploadConfigService = async () => {
  const config = await UploadConfig.findOneAndUpdate(
    { isActive: true },
    { $inc: { load: 1 } },
    { sort: { load: 1 }, new: true }
  );

  if (!config) {
    throw new ApiError(404, 'No active upload configuration available');
  }

  return config;
};

export const createUploadConfigService = async ({
  name = '',
  uploadUrl,
  isActive = true,
}) => {
  const config = await UploadConfig.create({
    name: name ? name.trim() : '',
    uploadUrl: uploadUrl.trim(),
    load: 0,
    isActive: Boolean(isActive),
  });

  return config;
};

export const updateUploadConfigService = async (id, payload) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Upload Config ID');
  }

  const config = await UploadConfig.findById(id);
  if (!config) {
    throw new ApiError(404, 'Upload configuration not found');
  }

  const { name, uploadUrl, load, isActive } = payload;

  if (name !== undefined) config.name = name.trim();
  if (uploadUrl !== undefined) config.uploadUrl = uploadUrl.trim();
  if (load !== undefined) config.load = Math.max(0, parseInt(load, 10) || 0);
  if (isActive !== undefined) config.isActive = Boolean(isActive);

  await config.save();
  return config;
};

export const deleteUploadConfigService = async (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Upload Config ID');
  }

  const config = await UploadConfig.findById(id);
  if (!config) {
    throw new ApiError(404, 'Upload configuration not found');
  }

  await UploadConfig.deleteOne({ _id: id });
  return config;
};
