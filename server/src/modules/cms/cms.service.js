import { Banner, ContactChannel, ContentBlock, ProductInfoBullet } from './cms.model.js';
import ApiError from '../../utils/ApiError.js';

// --- Banner Services ---
export const getBannersService = async (adminOnly = false) => {
  const filter = adminOnly ? {} : { isActive: true };
  return Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
};

export const createBannerService = async (data) => {
  return Banner.create(data);
};

export const updateBannerService = async (id, data) => {
  const banner = await Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!banner) throw new ApiError(404, 'Banner not found');
  return banner;
};

export const deleteBannerService = async (id) => {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw new ApiError(404, 'Banner not found');
  return { id };
};

// --- Contact Channel Services ---
export const getContactChannelsService = async (adminOnly = false) => {
  const filter = adminOnly ? {} : { isActive: true };
  return ContactChannel.find(filter).sort({ sortOrder: 1, createdAt: -1 });
};

export const createContactChannelService = async (data) => {
  return ContactChannel.create(data);
};

export const updateContactChannelService = async (id, data) => {
  const channel = await ContactChannel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!channel) throw new ApiError(404, 'Contact channel not found');
  return channel;
};

export const deleteContactChannelService = async (id) => {
  const channel = await ContactChannel.findByIdAndDelete(id);
  if (!channel) throw new ApiError(404, 'Contact channel not found');
  return { id };
};

// --- Content Block Services ---
export const DEFAULT_CONTENT_BLOCKS = [
  {
    key: 'about_us',
    title: 'About Us',
    body: 'Welcome to CommerceCore! We are dedicated to providing high quality e-commerce products and fast Cash-on-Delivery nationwide.',
  },
  {
    key: 'contact_us',
    title: 'Contact Us',
    body: 'For customer support, order inquiries, or assistance, reach out to us at support@commercecore.com or call 01700000000.',
  },
  {
    key: 'how_to_buy',
    title: 'How to Buy',
    body: '1. Browse our catalog and select your desired items.\n2. Add items to your cart and proceed to checkout.\n3. Enter your contact & delivery address and confirm your Cash-on-Delivery order!',
  },
  {
    key: 'return_policy',
    title: 'Return Policy',
    body: 'We accept return or exchange requests within 7 days of delivery for damaged or defective items in original unused packaging.',
  },
];

const ALLOWED_CONTENT_KEYS = ['about_us', 'contact_us', 'how_to_buy', 'return_policy'];

export const getContentBlocksService = async () => {
  const dbBlocks = await ContentBlock.find({ key: { $in: ALLOWED_CONTENT_KEYS } });
  const dbBlockMap = new Map(dbBlocks.map((b) => [b.key, b.toObject()]));

  return DEFAULT_CONTENT_BLOCKS.map((def) => {
    if (dbBlockMap.has(def.key)) {
      return dbBlockMap.get(def.key);
    }
    return { id: def.key, ...def };
  });
};

export const getContentBlockByKeyService = async (key) => {
  const lowerKey = key.toLowerCase();
  if (!ALLOWED_CONTENT_KEYS.includes(lowerKey)) {
    throw new ApiError(400, `Invalid content block key '${key}'. Allowed keys: ${ALLOWED_CONTENT_KEYS.join(', ')}`);
  }

  const block = await ContentBlock.findOne({ key: lowerKey });
  if (block) return block;

  const defaultBlock = DEFAULT_CONTENT_BLOCKS.find((b) => b.key === lowerKey);
  return { id: defaultBlock.key, ...defaultBlock };
};

export const upsertContentBlockService = async (key, data) => {
  const lowerKey = key.toLowerCase();
  if (!ALLOWED_CONTENT_KEYS.includes(lowerKey)) {
    throw new ApiError(400, `Invalid content block key '${key}'. Allowed keys: ${ALLOWED_CONTENT_KEYS.join(', ')}`);
  }

  return ContentBlock.findOneAndUpdate(
    { key: lowerKey },
    { ...data, key: lowerKey },
    { upsert: true, new: true, runValidators: true }
  );
};

export const deleteContentBlockService = async (key) => {
  const lowerKey = key.toLowerCase();
  if (!ALLOWED_CONTENT_KEYS.includes(lowerKey)) {
    throw new ApiError(400, `Invalid content block key '${key}'. Allowed keys: ${ALLOWED_CONTENT_KEYS.join(', ')}`);
  }

  const block = await ContentBlock.findOneAndDelete({ key: lowerKey });
  if (!block) throw new ApiError(404, `Content block '${key}' not found in database`);
  return { key: lowerKey };
};

// product info bullet services
export const getProductInfoBulletsService = async (adminOnly = false, productId = null) => {
  const filter = adminOnly ? {} : { isActive: true };
  if (productId) {
    filter.$or = [{ productId }, { productId: null }];
  }
  return ProductInfoBullet.find(filter).sort({ sortOrder: 1, createdAt: -1 });
};

export const createProductInfoBulletService = async (data) => {
  return ProductInfoBullet.create(data);
};

export const updateProductInfoBulletService = async (id, data) => {
  const bullet = await ProductInfoBullet.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!bullet) throw new ApiError(404, 'Product info bullet not found');
  return bullet;
};

export const deleteProductInfoBulletService = async (id) => {
  const bullet = await ProductInfoBullet.findByIdAndDelete(id);
  if (!bullet) throw new ApiError(404, 'Product info bullet not found');
  return { id };
};
