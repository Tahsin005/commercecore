import { Order, OrderItem } from './order.model.js';
import Product, { ProductVariantLink } from '../product/product.model.js';
import ProductVariant from '../product/productVariant.model.js';
import User from '../user/user.model.js';
import { generateAuthToken } from '../user/user.service.js';
import { syncGuestCartService, clearUserCartService } from '../cart/cart.service.js';
import { syncGuestWishlistService } from '../wishlist/wishlist.service.js';
import ApiError from '../../utils/ApiError.js';

export const createOrderService = async (orderPayload, reqUser = null) => {
  const {
    customerName,
    phone,
    email,
    shippingAddress,
    deliveryZone = 'inside_dhaka',
    items = [],
    guestCartItems = [],
    guestWishlistItems = [],
  } = orderPayload;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  let user = reqUser;
  let token = null;

  // handle Guest User Account Linking & Sync
  if (!user) {
    if (!phone) {
      throw new ApiError(400, 'Phone number is required for guest checkout');
    }

    user = await User.findOne({ phone: phone.trim() });

    if (!user) {
      const userEmail = email && email.trim() ? email.trim().toLowerCase() : `guest_${Date.now()}@commercecore.com`;

      user = await User.create({
        name: customerName.trim(),
        phone: phone.trim(),
        email: userEmail,
        password: null,
        isAdmin: false,
      });
    }

    token = generateAuthToken(user);

    if (guestCartItems.length > 0) {
      await syncGuestCartService(user.id, guestCartItems);
    }
    if (guestWishlistItems.length > 0) {
      await syncGuestWishlistService(user.id, guestWishlistItems);
    }
  }

  const deliveryCharge = deliveryZone === 'outside_dhaka' ? 120 : 60;

  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    let product = null;
    let variant = null;
    let pId = item.productId;
    let pvId = item.productVariantId;

    if (pvId) {
      variant = await ProductVariant.findById(pvId);
    }

    if (!pId && variant) {
      if (variant.productId) pId = variant.productId;
      else {
        const link = await ProductVariantLink.findOne({ productVariantId: variant.id });
        if (link) pId = link.productId;
      }
    }

    if (!pId) {
      throw new ApiError(400, 'Product ID is required for order items');
    }

    product = await Product.findById(pId);
    if (!product) {
      throw new ApiError(404, `Product with ID ${pId} not found`);
    }

    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;

    if (product.quantity < qty) {
      const label = item.selectedVariantLabel || (variant ? variant.label : '') || 'Standard';
      throw new ApiError(
        400,
        `Insufficient stock for "${product.name}" (${label}). Only ${product.quantity} available.`
      );
    }

    const unitPrice = product.price !== undefined && product.price !== null ? product.price : (product.defaultPrice || 0);
    const itemSubtotal = unitPrice * qty;
    subtotal += itemSubtotal;

    const variantLabel = item.selectedVariantLabel || (variant ? variant.label : '') || '';

    processedItems.push({
      product,
      productId: product.id,
      productVariantId: variant ? variant.id : null,
      productName: product.name,
      selectedVariantLabel: variantLabel,
      size: variantLabel,
      unitPrice,
      quantity: qty,
    });
  }

  const discountAmount = 0;
  const total = subtotal + deliveryCharge - discountAmount;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `CC-${dateStr}-${randomSeq}`;

  const order = await Order.create({
    orderNumber,
    userId: user.id,
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : user.email,
    shippingAddress: shippingAddress.trim(),
    deliveryZone,
    deliveryCharge,
    subtotal,
    discountAmount,
    total,
    status: 'PENDING',
  });

  const orderItems = await OrderItem.insertMany(
    processedItems.map(({ product, ...item }) => ({
      ...item,
      orderId: order.id,
    }))
  );

  for (const item of processedItems) {
    if (item.product.quantity >= item.quantity) {
      item.product.quantity -= item.quantity;
      await item.product.save();
    }
  }

  await clearUserCartService(user.id);

  return {
    order: order.toJSON(),
    items: orderItems,
    user: user.toJSON(),
    token,
  };
};

export const getOrderByNumberService = async (orderNumber) => {
  const order = await Order.findOne({ orderNumber }).populate('userId', 'name email phone');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const items = await OrderItem.find({ orderId: order.id })
    .populate('productId', 'name slug code price defaultPrice')
    .populate('productVariantId', 'label');

  return {
    order: order.toJSON(),
    items,
  };
};
