import { Cart, CartItem } from './cart.model.js';
import Product, { ProductVariantLink } from '../product/product.model.js';
import ProductVariant from '../product/productVariant.model.js';
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
    .populate('productId', 'name slug code price quantity isFeatured isActive')
    .populate('productVariantId', 'label order isActive');

  const formattedItems = items.map((item) => {
    const itemObj = item.toJSON();
    const product = item.productId;
    const variant = item.productVariantId;

    const prodObj = product && product.toJSON ? product.toJSON() : product;
    const varObj = variant && variant.toJSON ? variant.toJSON() : variant;

    if (prodObj) {
      prodObj.defaultPrice = prodObj.price;
    }

    return {
      ...itemObj,
      productVariantId: {
        id: varObj ? varObj.id : (itemObj.productVariantId || itemObj.productId),
        size: varObj ? varObj.label : 'Standard',
        productId: prodObj,
      },
    };
  });

  return {
    cartId: cart.id,
    items: formattedItems,
  };
};

export const addToCartService = async (userId, productId, productVariantId = null, quantity = 1) => {
  let pId = productId;
  let pvId = productVariantId;

  // Fallback: if caller passed productVariantId as first arg, resolve productId
  if (!pId && pvId) {
    const variant = await ProductVariant.findById(pvId);
    if (variant && variant.productId) {
      pId = variant.productId;
    } else if (variant) {
      const link = await ProductVariantLink.findOne({ productVariantId: variant.id });
      if (link) pId = link.productId;
    }
  }

  if (!pId) {
    throw new ApiError(400, 'Product ID is required');
  }

  const product = await Product.findById(pId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const cart = await getOrCreateCart(userId);

  let cartItem = await CartItem.findOne({
    cartId: cart.id,
    productId: pId,
    productVariantId: pvId || null,
  });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      cartId: cart.id,
      productId: pId,
      productVariantId: pvId || null,
      quantity,
    });
  }

  return getUserCartService(userId);
};

export const updateCartQuantityService = async (userId, itemId, quantity) => {
  if (quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1');
  }

  const cart = await getOrCreateCart(userId);

  let cartItem = await CartItem.findOne({
    cartId: cart.id,
    _id: itemId,
  });

  if (!cartItem) {
    cartItem = await CartItem.findOne({
      cartId: cart.id,
      $or: [{ productVariantId: itemId }, { productId: itemId }],
    });
  }

  if (!cartItem) {
    throw new ApiError(404, 'Cart item not found');
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  return getUserCartService(userId);
};

export const removeFromCartService = async (userId, itemId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ApiError(404, 'Cart item not found');
  }

  let result = await CartItem.deleteOne({
    cartId: cart.id,
    _id: itemId,
  });

  if (result.deletedCount === 0) {
    result = await CartItem.deleteOne({
      cartId: cart.id,
      $or: [{ productVariantId: itemId }, { productId: itemId }],
    });
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
    let pId = guestItem.productId;
    let pvId = guestItem.productVariantId || null;

    if (!pId && pvId) {
      const variant = await ProductVariant.findById(pvId);
      if (variant && variant.productId) pId = variant.productId;
      else if (variant) {
        const link = await ProductVariantLink.findOne({ productVariantId: variant.id });
        if (link) pId = link.productId;
      }
    }

    if (!pId) continue;

    const qty = guestItem.quantity && guestItem.quantity > 0 ? guestItem.quantity : 1;

    let cartItem = await CartItem.findOne({
      cartId: cart.id,
      productId: pId,
      productVariantId: pvId,
    });

    if (cartItem) {
      cartItem.quantity += qty;
      await cartItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId: pId,
        productVariantId: pvId,
        quantity: qty,
      });
    }
  }

  return getUserCartService(userId);
};
