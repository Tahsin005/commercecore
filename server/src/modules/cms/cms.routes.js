import express from 'express';
import {
  getBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getContactChannels,
  getAdminContactChannels,
  createContactChannel,
  updateContactChannel,
  deleteContactChannel,
  getContentBlocks,
  getContentBlockByKey,
  upsertContentBlock,
  deleteContentBlock,
  getProductInfoBullets,
  getAdminProductInfoBullets,
  createProductInfoBullet,
  updateProductInfoBullet,
  deleteProductInfoBullet,
} from './cms.controller.js';
import {
  bannerSchema,
  contactChannelSchema,
  contentBlockSchema,
  productInfoBulletSchema,
} from './cms.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// public cms routes
router.get('/banners', getBanners);
router.get('/contact-channels', getContactChannels);
router.get('/content-blocks/:key', getContentBlockByKey);
router.get('/info-bullets', getProductInfoBullets);

// admin protected cms routes
router.use('/admin', authenticateToken, requireAdmin);

// Banners
router.get('/admin/banners', getAdminBanners);
router.post('/admin/banners', validate(bannerSchema), createBanner);
router.put('/admin/banners/:id', validate(bannerSchema), updateBanner);
router.delete('/admin/banners/:id', deleteBanner);

// Contact Channels
router.get('/admin/contact-channels', getAdminContactChannels);
router.post('/admin/contact-channels', validate(contactChannelSchema), createContactChannel);
router.put('/admin/contact-channels/:id', validate(contactChannelSchema), updateContactChannel);
router.delete('/admin/contact-channels/:id', deleteContactChannel);

// Content Blocks
router.get('/admin/content-blocks', getContentBlocks);
router.put('/admin/content-blocks/:key', validate(contentBlockSchema), upsertContentBlock);
router.delete('/admin/content-blocks/:key', deleteContentBlock);

// Product Info Bullets
router.get('/admin/info-bullets', getAdminProductInfoBullets);
router.post('/admin/info-bullets', validate(productInfoBulletSchema), createProductInfoBullet);
router.put('/admin/info-bullets/:id', validate(productInfoBulletSchema), updateProductInfoBullet);
router.delete('/admin/info-bullets/:id', deleteProductInfoBullet);

export default router;
