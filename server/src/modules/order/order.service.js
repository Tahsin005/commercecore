import { Order, OrderItem } from './order.model.js';
import Product from '../product/product.model.js';
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

    // check if account already exists with phone number
    user = await User.findOne({ phone: phone.trim() });

    if (!user) {
      // create new user account for guest
      const userEmail = email && email.trim() ? email.trim().toLowerCase() : `guest_${Date.now()}@commercecore.com`;
      
      user = await User.create({
        name: customerName.trim(),
        phone: phone.trim(),
        email: userEmail,
        password: null, // guest checkout account without initial password
        isAdmin: false,
      });
    }

    // generate JWT token to log the guest user in seamlessly
    token = generateAuthToken(user);

    // sync guest localStorage cart & wishlist to newly linked account in DB
    if (guestCartItems.length > 0) {
      await syncGuestCartService(user.id, guestCartItems);
    }
    if (guestWishlistItems.length > 0) {
      await syncGuestWishlistService(user.id, guestWishlistItems);
    }
  }

  // delivery charge calculation: Inside Dhaka = 60 Taka, Outside Dhaka = 120 Taka
  const deliveryCharge = deliveryZone === 'outside_dhaka' ? 120 : 60;

  // process order items & snapshot prices
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new ApiError(404, `Product with ID ${item.productId} not found`);
    }

    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const unitPrice = product.price;
    const itemSubtotal = unitPrice * qty;
    subtotal += itemSubtotal;

    processedItems.push({
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity: qty,
    });
  }

  const discountAmount = 0;
  const total = subtotal + deliveryCharge - discountAmount;

  // Generate date-based unique order number
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

  // Create OrderItems records
  const orderItems = await OrderItem.insertMany(
    processedItems.map((item) => ({
      ...item,
      orderId: order.id,
    }))
  );

  // Automatically clear user DB cart upon successful order placement
  await clearUserCartService(user.id);

  return {
    order: order.toJSON(),
    items: orderItems,
    user: user.toJSON(),
    token, // returned for guest checkout to authenticate client seamlessly
  };
};

export const getOrderByNumberService = async (orderNumber) => {
  const order = await Order.findOne({ orderNumber }).populate('userId', 'name email phone');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const items = await OrderItem.find({ orderId: order.id }).populate('productId', 'name slug price');

  return {
    order: order.toJSON(),
    items,
  };
};
