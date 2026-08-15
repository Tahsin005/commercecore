import {
  getBannersService,
  createBannerService,
  updateBannerService,
  deleteBannerService,
  getContactChannelsService,
  createContactChannelService,
  updateContactChannelService,
  deleteContactChannelService,
  getContentBlocksService,
  getContentBlockByKeyService,
  upsertContentBlockService,
  deleteContentBlockService,
  getProductInfoBulletsService,
  createProductInfoBulletService,
  updateProductInfoBulletService,
  deleteProductInfoBulletService,
} from './cms.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

// --- Banners ---
export const getBanners = async (req, res, next) => {
  try {
    const banners = await getBannersService(false);
    res.status(200).json(new ApiResponse(200, banners, 'Banners retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAdminBanners = async (req, res, next) => {
  try {
    const banners = await getBannersService(true);
    res.status(200).json(new ApiResponse(200, banners, 'Admin banners retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const banner = await createBannerService(req.body);
    res.status(201).json(new ApiResponse(201, banner, 'Banner created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const banner = await updateBannerService(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, banner, 'Banner updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const result = await deleteBannerService(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Banner deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// --- Contact Channels ---
export const getContactChannels = async (req, res, next) => {
  try {
    const channels = await getContactChannelsService(false);
    res.status(200).json(new ApiResponse(200, channels, 'Contact channels retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAdminContactChannels = async (req, res, next) => {
  try {
    const channels = await getContactChannelsService(true);
    res.status(200).json(new ApiResponse(200, channels, 'Admin contact channels retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createContactChannel = async (req, res, next) => {
  try {
    const channel = await createContactChannelService(req.body);
    res.status(201).json(new ApiResponse(201, channel, 'Contact channel created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateContactChannel = async (req, res, next) => {
  try {
    const channel = await updateContactChannelService(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, channel, 'Contact channel updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteContactChannel = async (req, res, next) => {
  try {
    const result = await deleteContactChannelService(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Contact channel deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// --- Content Blocks ---
export const getContentBlocks = async (req, res, next) => {
  try {
    const blocks = await getContentBlocksService();
    res.status(200).json(new ApiResponse(200, blocks, 'Content blocks retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getContentBlockByKey = async (req, res, next) => {
  try {
    const block = await getContentBlockByKeyService(req.params.key);
    res.status(200).json(new ApiResponse(200, block, 'Content block retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const upsertContentBlock = async (req, res, next) => {
  try {
    const block = await upsertContentBlockService(req.params.key, req.body);
    res.status(200).json(new ApiResponse(200, block, 'Content block updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteContentBlock = async (req, res, next) => {
  try {
    const result = await deleteContentBlockService(req.params.key);
    res.status(200).json(new ApiResponse(200, result, 'Content block deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// --- Product Info Bullets ---
export const getProductInfoBullets = async (req, res, next) => {
  try {
    const bullets = await getProductInfoBulletsService(false, req.query.productId);
    res.status(200).json(new ApiResponse(200, bullets, 'Product info bullets retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAdminProductInfoBullets = async (req, res, next) => {
  try {
    const bullets = await getProductInfoBulletsService(true);
    res.status(200).json(new ApiResponse(200, bullets, 'Admin product info bullets retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createProductInfoBullet = async (req, res, next) => {
  try {
    const bullet = await createProductInfoBulletService(req.body);
    res.status(201).json(new ApiResponse(201, bullet, 'Product info bullet created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProductInfoBullet = async (req, res, next) => {
  try {
    const bullet = await updateProductInfoBulletService(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, bullet, 'Product info bullet updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProductInfoBullet = async (req, res, next) => {
  try {
    const result = await deleteProductInfoBulletService(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Product info bullet deleted successfully'));
  } catch (error) {
    next(error);
  }
};
