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
  const items = await WishlistItem.find({ wishlistId: wishlist.id })
    .populate({
      path: 'productId',
      select: 'name slug code price defaultPrice images colors isFeatured isActive',
    })
    .populate({
      path: 'productVariantId',
      select: 'label size overridePrice overrideDiscountPrice price discountPrice isActive',
    });

  const formattedItems = items.map((item) => {
    const itemObj = item.toJSON();
    if (itemObj.productId && itemObj.productId.price !== undefined) {
      itemObj.productId.defaultPrice = itemObj.productId.price;
    }
    const product = itemObj.productId;
    const color = itemObj.color;
    if (product && Array.isArray(product.images) && product.images.length > 0) {
      if (color && Array.isArray(product.colors)) {
        const colorIdx = product.colors.findIndex((c) => c && c.toLowerCase() === color.toLowerCase());
        itemObj.imageUrl = colorIdx !== -1 && product.images[colorIdx] ? product.images[colorIdx] : product.images[0];
      } else {
        itemObj.imageUrl = product.images[0];
      }
    }
    return itemObj;
  });

  return {
    wishlistId: wishlist.id,
    items: formattedItems,
  };
};

export const addToWishlistService = async (userId, productId, productVariantId = null, color = null) => {
  const pId = await resolveProductId(productId, productVariantId);
  if (!pId) {
    throw new ApiError(400, 'Product ID or valid product variant is required');
  }

  const product = await Product.findById(pId);
  if (!product || product.isActive === false) {
    throw new ApiError(404, 'Product not found or inactive');
  }

  const cleanColor = color && typeof color === 'string' && color.trim() ? color.trim() : null;
  const pvId = productVariantId && mongoose.Types.ObjectId.isValid(productVariantId) ? productVariantId : null;

  const wishlist = await getOrCreateWishlist(userId);
  const existing = await WishlistItem.findOne({
    wishlistId: wishlist.id,
    productId: pId,
    productVariantId: pvId,
    color: cleanColor,
  });

  if (!existing) {
    await WishlistItem.create({
      wishlistId: wishlist.id,
      productId: pId,
      productVariantId: pvId,
      color: cleanColor,
    });
  }

  return getUserWishlistService(userId);
};

export const removeFromWishlistService = async (userId, itemId, color = null) => {
  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(404, 'Wishlist item not found');
  }

  const wishlist = await Wishlist.findOne({ userId });
  if (wishlist && itemId) {
    const cleanColor = color && typeof color === 'string' && color.trim() ? color.trim() : null;
    const filter = {
      wishlistId: wishlist.id,
      $or: [{ productId: itemId }, { productVariantId: itemId }, { _id: itemId }],
    };
    if (cleanColor !== null) {
      filter.color = cleanColor;
    }
    await WishlistItem.deleteMany(filter);
  }
  return getUserWishlistService(userId);
};

export const syncGuestWishlistService = async (userId, guestItems = []) => {
  const wishlist = await getOrCreateWishlist(userId);

  for (const item of guestItems) {
    const pId = await resolveProductId(item.productId, item.productVariantId);
    if (!pId) continue;

    const cleanColor = item.color && typeof item.color === 'string' && item.color.trim() ? item.color.trim() : null;
    const pvId = item.productVariantId && mongoose.Types.ObjectId.isValid(item.productVariantId) ? item.productVariantId : null;

    const existing = await WishlistItem.findOne({
      wishlistId: wishlist.id,
      productId: pId,
      productVariantId: pvId,
      color: cleanColor,
    });

    if (!existing) {
      await WishlistItem.create({
        wishlistId: wishlist.id,
        productId: pId,
        productVariantId: pvId,
        color: cleanColor,
      });
    }
  }

  return getUserWishlistService(userId);
};
