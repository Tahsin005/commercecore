import { Wishlist, WishlistItem } from './wishlist.model.js';
import ProductVariant from '../product/productVariant.model.js';
import ApiError from '../../utils/ApiError.js';

export const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId });
  }
  return wishlist;
};

export const getUserWishlistService = async (userId) => {
  const wishlist = await getOrCreateWishlist(userId);
  const items = await WishlistItem.find({ wishlistId: wishlist.id }).populate({
    path: 'productVariantId',
    populate: {
      path: 'productId',
      select: 'name slug code defaultPrice isFeatured isActive',
    },
  });
  return {
    wishlistId: wishlist.id,
    items,
  };
};

export const addToWishlistService = async (userId, productVariantId) => {
  const variant = await ProductVariant.findById(productVariantId);
  if (!variant) {
    throw new ApiError(404, 'Product variant not found');
  }

  const wishlist = await getOrCreateWishlist(userId);
  const existing = await WishlistItem.findOne({ wishlistId: wishlist.id, productVariantId });
  if (!existing) {
    await WishlistItem.create({
      wishlistId: wishlist.id,
      productVariantId,
    });
  }

  return getUserWishlistService(userId);
};

export const removeFromWishlistService = async (userId, productVariantId) => {
  const wishlist = await Wishlist.findOne({ userId });
  if (wishlist) {
    await WishlistItem.deleteOne({ wishlistId: wishlist.id, productVariantId });
  }
  return getUserWishlistService(userId);
};

export const syncGuestWishlistService = async (userId, guestItems = []) => {
  const wishlist = await getOrCreateWishlist(userId);

  for (const item of guestItems) {
    if (!item.productVariantId) continue;
    const existing = await WishlistItem.findOne({ wishlistId: wishlist.id, productVariantId: item.productVariantId });
    if (!existing) {
      await WishlistItem.create({
        wishlistId: wishlist.id,
        productVariantId: item.productVariantId,
      });
    }
  }

  return getUserWishlistService(userId);
};
