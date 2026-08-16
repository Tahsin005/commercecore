import mongoose from 'mongoose';
import { Order, OrderItem } from './order.model.js';
import Product, { ProductVariantLink } from '../product/product.model.js';
import ProductVariant from '../product/productVariant.model.js';
import User from '../user/user.model.js';
import { generateAuthToken } from '../user/user.service.js';
import { syncGuestCartService, clearUserCartService } from '../cart/cart.service.js';
import { syncGuestWishlistService } from '../wishlist/wishlist.service.js';
import { getSiteSettingsService } from '../setting/setting.service.js';
import { orderStatusEnum } from './order.validation.js';
import ApiError from '../../utils/ApiError.js';

export const createOrderService = async (orderPayload, reqUser = null) => {
  const {
    customerName,
    phone,
    email,
    shippingAddress,
    notes,
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

  const siteSettings = await getSiteSettingsService();

  const deliveryCharge = deliveryZone === 'outside_dhaka'
    ? (siteSettings?.delivery_charge?.outsideDhaka ?? 120)
    : (siteSettings?.delivery_charge?.insideDhaka ?? 60);

  const variantIds = items.map((i) => i.productVariantId).filter(Boolean);
  const rawProductIds = items.map((i) => i.productId).filter(Boolean);

  const variants = variantIds.length > 0
    ? await ProductVariant.find({ _id: { $in: variantIds } })
    : [];
  const variantMap = new Map(variants.map((v) => [v.id.toString(), v]));

  const missingProductIdVariantIds = items
    .filter((i) => !i.productId && i.productVariantId)
    .map((i) => i.productVariantId);

  let variantLinks = [];
  if (missingProductIdVariantIds.length > 0) {
    variantLinks = await ProductVariantLink.find({
      productVariantId: { $in: missingProductIdVariantIds },
    });
  }
  const variantLinkMap = new Map(variantLinks.map((l) => [l.productVariantId.toString(), l.productId.toString()]));

  const allProductIds = new Set(rawProductIds);
  for (const item of items) {
    if (!item.productId && item.productVariantId) {
      const v = variantMap.get(item.productVariantId.toString());
      if (v && v.productId) {
        allProductIds.add(v.productId.toString());
      } else {
        const pIdFromLink = variantLinkMap.get(item.productVariantId.toString());
        if (pIdFromLink) allProductIds.add(pIdFromLink);
      }
    }
  }

  const products = allProductIds.size > 0
    ? await Product.find({ _id: { $in: Array.from(allProductIds) } })
    : [];
  const productMap = new Map(products.map((p) => [p.id.toString(), p]));

  const allVariantLinks = (allProductIds.size > 0 && variantIds.length > 0)
    ? await ProductVariantLink.find({
        productId: { $in: Array.from(allProductIds) },
        productVariantId: { $in: variantIds },
      }).populate('productVariantId')
    : [];
  const productVariantLinkSet = new Set(
    allVariantLinks
      .filter((l) => l.productVariantId && l.productVariantId.isActive === true)
      .map((l) => `${l.productId.toString()}_${l.productVariantId.id ? l.productVariantId.id.toString() : l.productVariantId.toString()}`)
  );

  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    let pId = item.productId;
    let pvId = item.productVariantId;

    if (!pId && pvId) {
      const v = variantMap.get(pvId.toString());
      if (v && v.productId) pId = v.productId.toString();
      else {
        const linkPId = variantLinkMap.get(pvId.toString());
        if (linkPId) pId = linkPId;
      }
    }

    if (!pId) {
      throw new ApiError(400, 'Product ID is required for order items');
    }

    const product = productMap.get(pId.toString());
    if (!product) {
      throw new ApiError(404, `Product with ID ${pId} not found`);
    }

    let variant = null;
    let selectedVariantLabel = '';
    if (pvId) {
      const isValidLink = productVariantLinkSet.has(`${pId.toString()}_${pvId.toString()}`);
      if (!isValidLink) {
        throw new ApiError(400, `Invalid product variant for product "${product.name}"`);
      }
      variant = variantMap.get(pvId.toString());
      selectedVariantLabel = variant ? variant.label : '';
    }

    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;

    const unitPrice = product.price !== undefined && product.price !== null ? product.price : (product.defaultPrice || 0);
    const itemSubtotal = unitPrice * qty;
    subtotal += itemSubtotal;

    processedItems.push({
      product,
      productId: product.id,
      productVariantId: variant ? variant.id : null,
      productName: product.name,
      selectedVariantLabel: selectedVariantLabel || 'Standard',
      size: selectedVariantLabel || 'Standard',
      unitPrice,
      quantity: qty,
    });
  }

  // Atomic stock deduction before persisting order records
  const deductedProducts = [];
  try {
    for (const item of processedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        throw new ApiError(
          400,
          `Insufficient stock for "${item.productName}" (${item.selectedVariantLabel}).`
        );
      }
      deductedProducts.push({ productId: item.productId, quantity: item.quantity });
    }
  } catch (error) {
    for (const dp of deductedProducts) {
      await Product.updateOne({ _id: dp.productId }, { $inc: { quantity: dp.quantity } });
    }
    throw error;
  }

  const roundedSubtotal = Math.round(subtotal * 100) / 100;

  let discountAmount = 0;
  const siteDiscount = siteSettings?.site_discount;

  if (siteDiscount && siteDiscount.isActive && siteDiscount.discountPercentage > 0) {
    const now = new Date();
    const startValid = !siteDiscount.startDate || new Date(siteDiscount.startDate) <= now;
    const endValid = !siteDiscount.endDate || new Date(siteDiscount.endDate) >= now;

    if (startValid && endValid) {
      discountAmount = Math.round(((roundedSubtotal * siteDiscount.discountPercentage) / 100) * 100) / 100;
    }
  }

  const rawTotal = roundedSubtotal + deliveryCharge - discountAmount;
  const total = Math.max(0, Math.round(rawTotal * 100) / 100);

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
    notes: notes ? notes.trim() : '',
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
    .populate('productId', 'name slug code price defaultPrice images')
    .populate('productVariantId', 'label');

  return {
    order: order.toJSON(),
    items,
  };
};

// Admin Services
export const getAllOrdersAdminService = async (query = {}) => {
  const { status, search, page = 1, limit = 50 } = query;
  const filter = {};

  if (status && status !== 'ALL') {
    filter.status = status;
  }

  if (search && search.trim()) {
    const trimmed = search.trim().slice(0, 100);
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { orderNumber: regex },
      { customerName: regex },
      { phone: regex },
      { email: regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 50);
  const skip = (pageNum - 1) * limitNum;

  const [orders, totalCount, [statsAggregate]] = await Promise.all([
    Order.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['CANCELLED', 'RETURNED']] },
                0,
                '$total',
              ],
            },
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const orderIds = orders.map((o) => o.id);
  const allOrderItems = await OrderItem.find({ orderId: { $in: orderIds } })
    .populate('productId', 'name slug code price defaultPrice images')
    .populate('productVariantId', 'label');

  const itemsByOrderId = allOrderItems.reduce((acc, item) => {
    const oid = item.orderId.toString();
    if (!acc[oid]) acc[oid] = [];
    acc[oid].push(item);
    return acc;
  }, {});

  const stats = statsAggregate || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  };

  const formattedOrders = orders.map((o) => ({
    ...o.toJSON(),
    items: itemsByOrderId[o.id] || [],
  }));

  return {
    orders: formattedOrders,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
    stats: {
      totalOrders: stats.totalOrders || 0,
      totalRevenue: stats.totalRevenue || 0,
      pendingOrders: stats.pendingOrders || 0,
      deliveredOrders: stats.deliveredOrders || 0,
      cancelledOrders: stats.cancelledOrders || 0,
    },
  };
};

export const getOrderByIdAdminService = async (orderId) => {
  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid Order ID');
  }

  const order = await Order.findById(orderId).populate('userId', 'name email phone');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const items = await OrderItem.find({ orderId: order.id })
    .populate('productId', 'name slug code price defaultPrice images')
    .populate('productVariantId', 'label');

  return {
    order: order.toJSON(),
    items,
  };
};

export const updateOrderStatusService = async (orderId, newStatus) => {
  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid Order ID');
  }

  if (!orderStatusEnum.options.includes(newStatus)) {
    throw new ApiError(400, 'Invalid status specified');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.status = newStatus;
  await order.save();

  return getOrderByIdAdminService(order.id);
};
