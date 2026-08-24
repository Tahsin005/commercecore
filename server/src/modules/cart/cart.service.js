import mongoose from 'mongoose';
import { Cart, CartItem } from './cart.model.js';
import Product from '../product/product.model.js';
import ProductVariantLink from '../product/productVariantLink.model.js';
import { resolveProductId, validateProductVariant } from '../product/product.service.js';
import ApiError from '../../utils/ApiError.js';

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId });
  }
  return cart;
};

export const getUserCartService = async (userId) => {
  const cart = await getOrCreateCart(userId);
  const items = await CartItem.find({ cartId: cart.id })
    .populate('productId', 'name slug code price discountPrice quantity isFeatured isActive images colors')
    .populate('productVariantId', 'label order isActive');

  const variantLinkQueries = items
    .filter((item) => item.productId && item.productVariantId)
    .map((item) => ({
      productId: item.productId._id || item.productId.id,
      productVariantId: item.productVariantId._id || item.productVariantId.id,
    }));

  const links = variantLinkQueries.length > 0
    ? await ProductVariantLink.find({ $or: variantLinkQueries })
    : [];

  const linkMap = new Map();
  links.forEach((l) => {
    linkMap.set(`${l.productId.toString()}_${l.productVariantId.toString()}`, l);
  });

  const formattedItems = items.map((item) => {
    const itemObj = item.toJSON();
    const product = item.productId;
    const variant = item.productVariantId;

    const prodObj = product && product.toJSON ? product.toJSON() : product;
    const varObj = variant && variant.toJSON ? variant.toJSON() : variant;

    const prodIdStr = prodObj ? (prodObj.id || prodObj._id || '').toString() : (itemObj.productId ? itemObj.productId.toString() : '');
    const varIdStr = varObj ? (varObj.id || varObj._id || '').toString() : null;

    let regularPrice = prodObj ? prodObj.price : 0;
    let discountPrice = prodObj ? (prodObj.discountPrice ?? null) : null;
    let variantStock = prodObj ? prodObj.quantity : 0;

    if (prodIdStr && varIdStr) {
      const link = linkMap.get(`${prodIdStr}_${varIdStr}`);
      if (link) {
        if (link.price !== undefined && link.price !== null) {
          regularPrice = link.price;
        }
        if (link.discountPrice !== undefined && link.discountPrice !== null) {
          discountPrice = link.discountPrice;
        }
        if (link.quantity !== undefined && link.quantity !== null) {
          variantStock = link.quantity;
        }
      }
    }

    const isOnSale = discountPrice !== null && discountPrice > 0 && discountPrice < regularPrice;
    const unitPrice = isOnSale ? discountPrice : regularPrice;

    if (prodObj) {
      prodObj.defaultPrice = prodObj.price;
      prodObj.regularPrice = regularPrice;
      prodObj.discountPrice = discountPrice;
      prodObj.price = unitPrice;
    }

    let itemColor = itemObj.color || null;
    let matchingImageUrl = null;
    if (prodObj && Array.isArray(prodObj.images) && prodObj.images.length > 0) {
      if (itemColor && Array.isArray(prodObj.colors)) {
        const cIdx = prodObj.colors.findIndex((c) => c && c.toLowerCase() === itemColor.toLowerCase());
        matchingImageUrl = cIdx !== -1 && prodObj.images[cIdx] ? prodObj.images[cIdx] : prodObj.images[0];
      } else {
        matchingImageUrl = prodObj.images[0];
      }
    }

    return {
      ...itemObj,
      productId: prodObj,
      color: itemColor,
      imageUrl: matchingImageUrl,
      price: unitPrice,
      unitPrice,
      regularPrice,
      discountPrice,
      productVariantId: {
        id: varIdStr || prodIdStr,
        size: varObj ? (varObj.label || varObj.size) : 'Standard',
        price: unitPrice,
        regularPrice,
        discountPrice,
        quantity: variantStock,
        productId: prodObj,
      },
    };
  });

  return {
    cartId: cart.id,
    items: formattedItems,
  };
};

export const addToCartService = async (userId, productId, productVariantId = null, quantity = 1, color = null) => {
  const pId = await resolveProductId(productId, productVariantId);

  if (!pId) {
    throw new ApiError(400, 'Product ID is required');
  }

  const product = await Product.findById(pId);
  if (!product || product.isActive === false) {
    throw new ApiError(404, 'Product not found or inactive');
  }

  let finalVariantId = productVariantId || null;
  let link = null;

  if (finalVariantId) {
    link = await validateProductVariant(pId, finalVariantId);
  } else {
    // If no variant was explicitly selected (e.g. moving from wishlist), fallback to the first active variant
    const links = await ProductVariantLink.find({ productId: pId }).populate('productVariantId');
    const activeLinks = links.filter((l) => l.productVariantId && l.productVariantId.isActive === true);
    link = activeLinks.find((l) => (l.quantity || 0) > 0) || activeLinks[0] || null;
    if (link) {
      finalVariantId = link.productVariantId?._id || link.productVariantId?.id || link.productVariantId;
    }
  }

  if (!finalVariantId) {
    throw new ApiError(400, 'Product variant selection is required');
  }

  let availableStock = 0;
  if (link && link.quantity !== undefined && link.quantity !== null) {
    availableStock = link.quantity;
  }

  const cart = await getOrCreateCart(userId);

  let cleanColor = null;
  if (color && typeof color === 'string' && color.trim()) {
    const trimmed = color.trim();
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      const match = product.colors.find((c) => c && c.trim().toLowerCase() === trimmed.toLowerCase());
      if (!match) {
        throw new ApiError(400, `Invalid color "${trimmed}" for product "${product.name}"`);
      }
      cleanColor = match.trim();
    } else {
      throw new ApiError(400, `Product "${product.name}" does not have color options`);
    }
  }

  let cartItem = await CartItem.findOne({
    cartId: cart.id,
    productId: pId,
    productVariantId: finalVariantId,
    color: cleanColor,
  });

  const totalQuantity = (cartItem ? cartItem.quantity : 0) + quantity;
  if (totalQuantity > availableStock) {
    throw new ApiError(400, `Requested quantity exceeds available stock (${availableStock})`);
  }

  if (cartItem) {
    cartItem.quantity = totalQuantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      cartId: cart.id,
      productId: pId,
      productVariantId: finalVariantId,
      color: cleanColor,
      quantity,
    });
  }

  return getUserCartService(userId);
};

export const updateCartQuantityService = async (userId, itemId, quantity, color = null) => {
  if (quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1');
  }

  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(404, 'Cart item not found');
  }

  const cleanColor = color && typeof color === 'string' && color.trim() ? color.trim() : null;
  const cart = await getOrCreateCart(userId);

  let cartItem = await CartItem.findOne({
    cartId: cart.id,
    _id: itemId,
  });

  if (!cartItem) {
    const query = {
      cartId: cart.id,
      productVariantId: itemId,
    };
    if (cleanColor !== null) {
      query.color = cleanColor;
    }
    cartItem = await CartItem.findOne(query);
  }

  if (!cartItem) {
    const query = {
      cartId: cart.id,
      productId: itemId,
      productVariantId: null,
    };
    if (cleanColor !== null) {
      query.color = cleanColor;
    }
    cartItem = await CartItem.findOne(query);
  }

  if (!cartItem) {
    throw new ApiError(404, 'Cart item not found');
  }

  if (cartItem.productId && cartItem.productVariantId) {
    const link = await ProductVariantLink.findOne({
      productId: cartItem.productId,
      productVariantId: cartItem.productVariantId,
    });
    if (link && quantity > link.quantity) {
      throw new ApiError(400, `Requested quantity exceeds available stock (${link.quantity})`);
    }
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  return getUserCartService(userId);
};

export const removeFromCartService = async (userId, itemId, color = null) => {
  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(404, 'Cart item not found');
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart item not found');
  }

  const cleanColor = color && typeof color === 'string' && color.trim() ? color.trim() : null;

  let result = await CartItem.deleteOne({
    cartId: cart.id,
    _id: itemId,
  });

  if (result.deletedCount === 0) {
    const query = {
      cartId: cart.id,
      productVariantId: itemId,
    };
    if (cleanColor !== null) {
      query.color = cleanColor;
    }
    result = await CartItem.deleteOne(query);
  }

  if (result.deletedCount === 0) {
    const query = {
      cartId: cart.id,
      productId: itemId,
      productVariantId: null,
    };
    if (cleanColor !== null) {
      query.color = cleanColor;
    }
    result = await CartItem.deleteOne(query);
  }

  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Cart item not found');
  }

  return getUserCartService(userId);
};

export const clearUserCartService = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (cart) {
    await CartItem.deleteMany({ cartId: cart.id });
  }
};

export const syncGuestCartService = async (userId, guestItems = []) => {
  const cart = await getOrCreateCart(userId);

  for (const guestItem of guestItems) {
    let pId = await resolveProductId(guestItem.productId, guestItem.productVariantId);
    let pvId = guestItem.productVariantId || null;

    if (!pId) continue;

    if (pvId) {
      try {
        await validateProductVariant(pId, pvId);
      } catch (err) {
        pvId = null;
      }
    }

    if (!pvId) {
      const links = await ProductVariantLink.find({ productId: pId }).populate('productVariantId');
      const activeLinks = links.filter((l) => l.productVariantId && l.productVariantId.isActive === true);
      const link = activeLinks.find((l) => (l.quantity || 0) > 0) || activeLinks[0] || null;
      if (link) {
        pvId = link.productVariantId?._id || link.productVariantId?.id || link.productVariantId;
      }
    }

    if (!pvId) continue;

    const qty = guestItem.quantity && guestItem.quantity > 0 ? guestItem.quantity : 1;
    const cleanColor = guestItem.color && typeof guestItem.color === 'string' && guestItem.color.trim() ? guestItem.color.trim() : null;

    let cartItem = await CartItem.findOne({
      cartId: cart.id,
      productId: pId,
      productVariantId: pvId,
      color: cleanColor,
    });

    if (cartItem) {
      cartItem.quantity += qty;
      await cartItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId: pId,
        productVariantId: pvId,
        color: cleanColor,
        quantity: qty,
      });
    }
  }

  return getUserCartService(userId);
};
