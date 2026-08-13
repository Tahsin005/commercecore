import { Cart, CartItem } from './cart.model.js';
import ProductVariant from '../product/productVariant.model.js';
import ApiError from '../../utils/ApiError.js';

export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId });
  }
  return cart;
};

export const getUserCartService = async (userId) => {
  const cart = await getOrCreateCart(userId);
  const items = await CartItem.find({ cartId: cart.id }).populate({
    path: 'productVariantId',
    populate: {
      path: 'productId',
      select: 'name slug code defaultPrice isFeatured isActive',
    },
  });
  return {
    cartId: cart.id,
    items,
  };
};

export const addToCartService = async (userId, productVariantId, quantity = 1) => {
  const variant = await ProductVariant.findById(productVariantId);
  if (!variant) {
    throw new ApiError(404, 'Product variant not found');
  }

  const cart = await getOrCreateCart(userId);
  let cartItem = await CartItem.findOne({ cartId: cart.id, productVariantId });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      cartId: cart.id,
      productVariantId,
      quantity,
    });
  }

  return getUserCartService(userId);
};

export const updateCartQuantityService = async (userId, productVariantId, quantity) => {
  const cart = await getOrCreateCart(userId);
  let cartItem = await CartItem.findOne({ cartId: cart.id, productVariantId });

  if (!cartItem) {
    if (quantity > 0) {
      return addToCartService(userId, productVariantId, quantity);
    }
    return getUserCartService(userId);
  }

  if (quantity <= 0) {
    await CartItem.deleteOne({ _id: cartItem.id });
  } else {
    cartItem.quantity = quantity;
    await cartItem.save();
  }

  return getUserCartService(userId);
};

export const removeFromCartService = async (userId, productVariantId) => {
  const cart = await Cart.findOne({ userId });
  if (cart) {
    await CartItem.deleteOne({ cartId: cart.id, productVariantId });
  }
  return getUserCartService(userId);
};

export const clearUserCartService = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (cart) {
    await CartItem.deleteMany({ cartId: cart.id });
  }
  return { cartId: cart ? cart.id : null, items: [] };
};

export const syncGuestCartService = async (userId, guestItems = []) => {
  const cart = await getOrCreateCart(userId);

  for (const item of guestItems) {
    if (!item.productVariantId) continue;
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const existing = await CartItem.findOne({ cartId: cart.id, productVariantId: item.productVariantId });
    if (existing) {
      existing.quantity += qty;
      await existing.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productVariantId: item.productVariantId,
        quantity: qty,
      });
    }
  }

  return getUserCartService(userId);
};
