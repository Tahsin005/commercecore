import mongoose from 'mongoose';
import { Wishlist, WishlistItem } from './wishlist.model.js';
import Product from '../product/product.model.js';
import { resolveProductId } from '../product/product.service.js';
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
    path: 'productId',
    select: 'name slug code price defaultPrice isFeatured isActive',
  });

  const formattedItems = items.map((item) => {
    const itemObj = item.toJSON();
    if (itemObj.productId && itemObj.productId.price !== undefined) {
      itemObj.productId.defaultPrice = itemObj.productId.price;
    }
    return itemObj;
  });

  return {
    wishlistId: wishlist.id,
    items: formattedItems,
  };
};

export const addToWishlistService = async (userId, productId, productVariantId = null) => {
  const pId = await resolveProductId(productId, productVariantId);
  if (!pId) {
    throw new ApiError(400, 'Product ID or valid product variant is required');
  }

  const product = await Product.findById(pId);
  if (!product || product.isActive === false) {
    throw new ApiError(404, 'Product not found or inactive');
  }

  const wishlist = await getOrCreateWishlist(userId);
  const existing = await WishlistItem.findOne({ wishlistId: wishlist.id, productId: pId });
  if (!existing) {
    await WishlistItem.create({
      wishlistId: wishlist.id,
      productId: pId,
    });
  }

  return getUserWishlistService(userId);
};

export const removeFromWishlistService = async (userId, itemId) => {
  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(404, 'Wishlist item not found');
  }

  const wishlist = await Wishlist.findOne({ userId });
  if (wishlist && itemId) {
    let result = await WishlistItem.deleteOne({ wishlistId: wishlist.id, productId: itemId });
    if (result.deletedCount === 0) {
      await WishlistItem.deleteOne({ wishlistId: wishlist.id, _id: itemId });
    }
  }
  return getUserWishlistService(userId);
};

export const syncGuestWishlistService = async (userId, guestItems = []) => {
  const wishlist = await getOrCreateWishlist(userId);

  for (const item of guestItems) {
    const pId = await resolveProductId(item.productId, item.productVariantId);
    if (!pId) continue;
    const existing = await WishlistItem.findOne({ wishlistId: wishlist.id, productId: pId });
    if (!existing) {
      await WishlistItem.create({
        wishlistId: wishlist.id,
        productId: pId,
      });
    }
  }

  return getUserWishlistService(userId);
};
