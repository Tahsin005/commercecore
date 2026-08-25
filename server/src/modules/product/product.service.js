import mongoose from 'mongoose';
import Product, { ProductVariant, ProductVariantLink } from './product.model.js';
import Category from '../category/category.model.js';
import { CartItem } from '../cart/cart.model.js';
import { WishlistItem } from '../wishlist/wishlist.model.js';
import ApiError from '../../utils/ApiError.js';

let cachedPriceBounds = null;
let cachedPriceBoundsExpiry = 0;

export const invalidatePriceBoundsCache = () => {
  cachedPriceBounds = null;
  cachedPriceBoundsExpiry = 0;
};

const getCachedPriceBounds = async () => {
  const now = Date.now();
  if (cachedPriceBounds && now < cachedPriceBoundsExpiry) {
    return cachedPriceBounds;
  }
  const priceBoundsAgg = await Product.aggregate([
    { $match: { isActive: { $ne: false } } },
    {
      $project: {
        effectivePrice: {
          $cond: {
            if: { $and: [{ $ne: ['$discountPrice', null] }, { $gt: ['$discountPrice', 0] }] },
            then: '$discountPrice',
            else: '$price',
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$effectivePrice' },
        maxPrice: { $max: '$effectivePrice' },
      },
    },
  ]);
  cachedPriceBounds = priceBoundsAgg;
  cachedPriceBoundsExpiry = now + 60 * 1000;
  return priceBoundsAgg;
};

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const validateAndVerifyVariantIds = async (variantIds = [], session = null) => {
  if (!Array.isArray(variantIds) || variantIds.length === 0) return;
  for (const vId of variantIds) {
    if (!mongoose.Types.ObjectId.isValid(vId)) {
      throw new ApiError(400, `Invalid variant ObjectId: ${vId}`);
    }
  }

  const query = ProductVariant.find({ _id: { $in: variantIds } });
  if (session) query.session(session);
  const foundVariants = await query;

  if (foundVariants.length !== variantIds.length) {
    throw new ApiError(400, 'One or more referenced product variants do not exist');
  }
};

const normalizeAndValidateVariants = async (variantsInput, variantIdsInput, session = null, productPrice = null) => {
  let normalized = [];
  if (Array.isArray(variantsInput) && variantsInput.length > 0) {
    normalized = variantsInput.map((v) => {
      const vPrice = typeof v === 'object' && v.price !== undefined && v.price !== null && String(v.price).trim() !== '' ? Number(v.price) : null;
      const vDiscountPrice = typeof v === 'object' && v.discountPrice !== undefined && v.discountPrice !== null && String(v.discountPrice).trim() !== '' ? Number(v.discountPrice) : null;
      return {
        productVariantId: typeof v === 'string' ? v : v.productVariantId || v.variantId || v.id,
        price: vPrice,
        discountPrice: vDiscountPrice,
        quantity: typeof v === 'object' && v.quantity !== undefined ? Number(v.quantity) : 0,
      };
    });
  } else if (Array.isArray(variantIdsInput) && variantIdsInput.length > 0) {
    normalized = variantIdsInput.map((vId) => ({
      productVariantId: vId,
      price: null,
      discountPrice: null,
      quantity: 0,
    }));
  } else {
    return [];
  }

  const vIds = normalized.map((item) => item.productVariantId);
  await validateAndVerifyVariantIds(vIds, session);

  if (productPrice !== null) {
    for (const item of normalized) {
      const effectivePrice = item.price !== null ? item.price : productPrice;
      if (item.discountPrice !== null && item.discountPrice >= effectivePrice) {
        throw new ApiError(400, 'Variant discount price must be less than regular price');
      }
    }
  }

  return normalized;
};

const processAndSortVariants = (links, defaultPrice = 0, defaultDiscountPrice = null) => {
  return links
    .filter((l) => l.productVariantId && l.productVariantId.isActive === true)
    .map((l) => {
      const v = l.productVariantId.toJSON ? l.productVariantId.toJSON() : l.productVariantId;
      const variantPrice = l.price !== undefined && l.price !== null ? l.price : defaultPrice;
      const variantDiscountPrice = l.discountPrice !== undefined && l.discountPrice !== null ? l.discountPrice : defaultDiscountPrice;
      return {
        ...v,
        size: v.label,
        price: variantPrice,
        overridePrice: l.price ?? null,
        discountPrice: variantDiscountPrice ?? null,
        overrideDiscountPrice: l.discountPrice ?? null,
        quantity: l.quantity ?? 0,
      };
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const resolveProductId = async (productId, productVariantId) => {
  if (productId) return productId;
  if (productVariantId) {
    const variant = await ProductVariant.findById(productVariantId);
    if (variant && variant.productId) return variant.productId;
    if (variant) {
      const link = await ProductVariantLink.findOne({ productVariantId: variant._id || variant.id });
      if (link) return link.productId;
    }
  }
  return null;
};

export const validateProductVariant = async (productId, productVariantId) => {
  if (!productVariantId) return null;
  const link = await ProductVariantLink.findOne({ productId, productVariantId }).populate('productVariantId');
  if (!link || !link.productVariantId || link.productVariantId.isActive !== true) {
    throw new ApiError(400, 'Invalid product variant for this product');
  }
  return link;
};

export const getAllProductsService = async (query = {}) => {
  const filter = {};
  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }
  if (query.isFeatured !== undefined) {
    filter.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true' || query.isActive === true;
  }

  // Partial match search on name, description, and code
  if (query.search && typeof query.search === 'string' && query.search.trim() !== '') {
    const searchRegex = new RegExp(query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { code: { $regex: searchRegex } },
    ];
  }

  // Min & Max price range filtering (supporting effective price)
  if (
    (query.minPrice !== undefined && query.minPrice !== '') ||
    (query.maxPrice !== undefined && query.maxPrice !== '')
  ) {
    const minP = query.minPrice !== undefined && query.minPrice !== '' ? Number(query.minPrice) : null;
    const maxP = query.maxPrice !== undefined && query.maxPrice !== '' ? Number(query.maxPrice) : null;

    const priceConditions = [];
    if (minP !== null && !isNaN(minP)) {
      priceConditions.push({
        $or: [
          { $and: [{ discountPrice: { $gt: 0 } }, { discountPrice: { $gte: minP } }] },
          {
            $and: [
              { $or: [{ discountPrice: null }, { discountPrice: { $exists: false } }, { discountPrice: { $lte: 0 } }] },
              { price: { $gte: minP } },
            ],
          },
        ],
      });
    }
    if (maxP !== null && !isNaN(maxP)) {
      priceConditions.push({
        $or: [
          { $and: [{ discountPrice: { $gt: 0 } }, { discountPrice: { $lte: maxP } }] },
          {
            $and: [
              { $or: [{ discountPrice: null }, { discountPrice: { $exists: false } }, { discountPrice: { $lte: 0 } }] },
              { price: { $lte: maxP } },
            ],
          },
        ],
      });
    }

    if (priceConditions.length > 0) {
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, ...priceConditions];
        delete filter.$or;
      } else if (filter.$and) {
        filter.$and.push(...priceConditions);
      } else {
        filter.$and = priceConditions;
      }
    }
  }

  // Sorting
  let sortOptions = { createdAt: -1 };
  if (query.sortBy === 'price_asc') {
    sortOptions = { price: 1, createdAt: -1 };
  } else if (query.sortBy === 'price_desc') {
    sortOptions = { price: -1, createdAt: -1 };
  } else if (query.sortBy === 'oldest') {
    sortOptions = { createdAt: 1 };
  } else if (query.sortBy === 'name_asc') {
    sortOptions = { name: 1 };
  } else if (query.sortBy === 'name_desc') {
    sortOptions = { name: -1 };
  } else if (query.sortBy === 'newest') {
    sortOptions = { createdAt: -1 };
  }

  // Pagination
  const isPaginated = query.page !== undefined || (query.limit !== undefined && Number(query.limit) > 0);
  const page = Math.max(1, parseInt(query.page || 1, 10));
  const limit = query.limit !== undefined ? Math.max(0, parseInt(query.limit, 10)) : (isPaginated ? 12 : 0);

  const [totalProducts, priceBoundsAgg] = await Promise.all([
    Product.countDocuments(filter),
    getCachedPriceBounds(),
  ]);

  const globalMinPrice = priceBoundsAgg[0]?.minPrice != null ? Math.floor(priceBoundsAgg[0].minPrice) : 10;
  const globalMaxPrice = priceBoundsAgg[0]?.maxPrice != null ? Math.ceil(priceBoundsAgg[0].maxPrice) : 99999;

  let productQuery = Product.find(filter)
    .populate('categoryId', 'name slug isFeatured')
    .sort(sortOptions);

  if (limit > 0) {
    const skip = (page - 1) * limit;
    productQuery = productQuery.skip(skip).limit(limit);
  }

  const products = await productQuery;

  const productIds = products.map((p) => p.id);
  const links = await ProductVariantLink.find({ productId: { $in: productIds } }).populate('productVariantId');

  const linksByProduct = links.reduce((acc, link) => {
    const pid = link.productId.toString();
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(link);
    return acc;
  }, {});

  const formattedProducts = products.map((p) => {
    const variants = processAndSortVariants(linksByProduct[p.id] || [], p.price, p.discountPrice);
    const totalQuantity = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    return {
      ...p.toJSON(),
      defaultPrice: p.price,
      discountPrice: p.discountPrice ?? null,
      defaultDiscountPrice: p.discountPrice ?? null,
      quantity: totalQuantity,
      variants,
    };
  });

  const effectiveLimit = limit > 0 ? limit : totalProducts;
  const totalPages = effectiveLimit > 0 ? Math.ceil(totalProducts / effectiveLimit) : 1;

  return {
    products: formattedProducts,
    pagination: {
      totalProducts,
      totalPages: totalPages || 1,
      currentPage: page,
      limit: effectiveLimit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    priceBounds: {
      minPrice: globalMinPrice,
      maxPrice: globalMaxPrice > globalMinPrice ? globalMaxPrice : globalMinPrice + 1000,
    },
  };
};

export const getProductByIdService = async (productId) => {
  const product = await Product.findById(productId).populate('categoryId', 'name slug isFeatured');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  const links = await ProductVariantLink.find({ productId: product.id }).populate('productVariantId');
  const variants = processAndSortVariants(links, product.price, product.discountPrice);
  const totalQuantity = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);

  return {
    ...product.toJSON(),
    defaultPrice: product.price,
    discountPrice: product.discountPrice ?? null,
    defaultDiscountPrice: product.discountPrice ?? null,
    quantity: totalQuantity,
    variants,
  };
};

export const getProductBySlugService = async (slug) => {
  const product = await Product.findOne({ slug }).populate('categoryId', 'name slug isFeatured');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  const links = await ProductVariantLink.find({ productId: product.id }).populate('productVariantId');
  const variants = processAndSortVariants(links, product.price, product.discountPrice);
  const totalQuantity = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);

  return {
    ...product.toJSON(),
    defaultPrice: product.price,
    discountPrice: product.discountPrice ?? null,
    defaultDiscountPrice: product.discountPrice ?? null,
    quantity: totalQuantity,
    variants,
  };
};

export const getProductVariantsService = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  const links = await ProductVariantLink.find({ productId: product.id }).populate('productVariantId');
  return processAndSortVariants(links, product.price, product.discountPrice);
};

export const getGlobalVariantsService = async (includeAll = false) => {
  const filter = includeAll ? {} : { isActive: true };
  return ProductVariant.find(filter).sort({ order: 1 });
};

export const createProductService = async ({
  name,
  slug,
  code = '',
  categoryId,
  description = '',
  price,
  discountPrice = null,
  quantity = 0,
  isFeatured = false,
  isActive = true,
  images = [],
  colors = [],
  variantIds = [],
  variants = [],
  seo = undefined,
}) => {
  const finalSlug = generateSlug(slug || name);
  if (!finalSlug) {
    throw new ApiError(400, 'Invalid product name or slug');
  }

  if (!categoryId) {
    throw new ApiError(400, 'Product category is required');
  }

  const categoryObj = await Category.findById(categoryId);
  if (!categoryObj) {
    throw new ApiError(404, 'Selected category does not exist');
  }

  const normalizedVariants = await normalizeAndValidateVariants(variants, variantIds, null, Number(price));

  const existing = await Product.findOne({ slug: finalSlug });
  if (existing) {
    throw new ApiError(400, 'Product with this slug already exists');
  }

  const cleanDiscountPrice =
    discountPrice !== undefined && discountPrice !== null && String(discountPrice).trim() !== '' && Number(discountPrice) > 0
      ? Number(discountPrice)
      : null;
  if (cleanDiscountPrice !== null && cleanDiscountPrice >= Number(price)) {
    throw new ApiError(400, 'Discount price must be less than regular price');
  }

  let session = null;
  let useTransaction = false;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch {
    session = null;
    useTransaction = false;
  }

  try {
    const opts = session ? { session } : {};
    const finalImages = Array.isArray(images) ? images : [];
    let finalColors = Array.isArray(colors) ? colors : [];
    if (finalColors.length > 0 && finalColors.length !== finalImages.length) {
      throw new ApiError(400, 'Number of colors must match the number of images');
    }

    const [product] = await Product.create(
      [
        {
          name,
          slug: finalSlug,
          code,
          categoryId,
          description,
          price: Number(price),
          discountPrice: cleanDiscountPrice,
          isFeatured: Boolean(isFeatured),
          isActive: Boolean(isActive),
          images: finalImages,
          colors: finalColors,
          seo: seo || undefined,
        },
      ],
      opts
    );

    if (normalizedVariants.length > 0) {
      const linkDocs = normalizedVariants.map((item) => ({
        productId: product.id,
        productVariantId: item.productVariantId,
        price: item.price,
        discountPrice: item.discountPrice,
        quantity: item.quantity,
      }));
      await ProductVariantLink.insertMany(linkDocs, opts);
    }

    if (useTransaction && session) {
      await session.commitTransaction();
    }
    invalidatePriceBoundsCache();
    return getProductByIdService(product.id);
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const updateProductService = async (
  id,
  {
    name,
    slug,
    code,
    categoryId,
    description,
    price,
    discountPrice,
    quantity,
    isFeatured,
    isActive,
    images,
    colors,
    variantIds,
    variants,
    seo,
  }
) => {
  let session = null;
  let useTransaction = false;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch {
    session = null;
    useTransaction = false;
  }

  try {
    const opts = session ? { session } : {};
    const product = await Product.findById(id).session(session || null);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (name !== undefined) product.name = name;
    if (code !== undefined) product.code = code;
    if (description !== undefined) product.description = description;
    if (seo !== undefined) product.seo = seo;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) {
      const cleanDiscountPrice =
        discountPrice !== null && String(discountPrice).trim() !== '' && Number(discountPrice) > 0
          ? Number(discountPrice)
          : null;
      if (cleanDiscountPrice !== null && cleanDiscountPrice >= product.price) {
        throw new ApiError(400, 'Discount price must be less than regular price');
      }
      product.discountPrice = cleanDiscountPrice;
    } else if (price !== undefined) {
      if (product.discountPrice !== null && product.discountPrice >= product.price) {
        throw new ApiError(400, 'Discount price must be less than regular price');
      }
    }
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) product.isActive = Boolean(isActive);
    if (images !== undefined) product.images = Array.isArray(images) ? images : [];
    if (colors !== undefined) product.colors = Array.isArray(colors) ? colors : [];
    if (product.colors.length > 0 && product.colors.length !== product.images.length) {
      throw new ApiError(400, 'Number of colors must match the number of images');
    }

    if (categoryId !== undefined) {
      if (!categoryId) {
        throw new ApiError(400, 'Product category cannot be empty');
      }
      const categoryObj = await Category.findById(categoryId).session(session || null);
      if (!categoryObj) {
        throw new ApiError(404, 'Selected category does not exist');
      }
      product.categoryId = categoryId;
    }

    if (slug !== undefined || name !== undefined) {
      const candidateSlug = generateSlug(slug || product.name);
      if (candidateSlug !== product.slug) {
        const existing = await Product.findOne({ slug: candidateSlug, _id: { $ne: id } }).session(session || null);
        if (existing) {
          throw new ApiError(400, 'Product with this slug already exists');
        }
        product.slug = candidateSlug;
      }
    }

    let normalizedVariants = null;
    if (variants !== undefined || variantIds !== undefined) {
      normalizedVariants = await normalizeAndValidateVariants(variants, variantIds, session, product.price);
    }

    await product.save(opts);

    if (normalizedVariants !== null) {
      await ProductVariantLink.deleteMany({ productId: id }, opts);
      if (normalizedVariants.length > 0) {
        const linkDocs = normalizedVariants.map((item) => ({
          productId: id,
          productVariantId: item.productVariantId,
          price: item.price,
          discountPrice: item.discountPrice,
          quantity: item.quantity,
        }));
        await ProductVariantLink.insertMany(linkDocs, opts);
      }
    } else if (price !== undefined) {
      const invalidLink = await ProductVariantLink.findOne({
        productId: id,
        price: null,
        discountPrice: { $ne: null, $gte: product.price },
      }).session(session || null);
      if (invalidLink) {
        throw new ApiError(400, 'Variant discount price must be less than regular price');
      }
    }

    if (useTransaction && session) {
      await session.commitTransaction();
    }
    invalidatePriceBoundsCache();
    return getProductByIdService(id);
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const deleteProductService = async (id) => {
  let session = null;
  let useTransaction = false;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch {
    session = null;
    useTransaction = false;
  }

  try {
    const opts = session ? { session } : {};
    const product = await Product.findById(id).session(session || null);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    await CartItem.deleteMany({ productId: id }, opts);
    await WishlistItem.deleteMany({ productId: id }, opts);
    await ProductVariantLink.deleteMany({ productId: id }, opts);
    await Product.deleteOne({ _id: id }, opts);

    if (useTransaction && session) {
      await session.commitTransaction();
    }
    invalidatePriceBoundsCache();
    return product;
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// Global Product Variant Services
export const createGlobalVariantService = async ({ label, order = 0, isActive = true }) => {
  const existing = await ProductVariant.findOne({ label: label.trim() });
  if (existing) {
    throw new ApiError(400, 'Variant with this label already exists');
  }

  return ProductVariant.create({
    label: label.trim(),
    order,
    isActive: Boolean(isActive),
  });
};

export const updateGlobalVariantService = async (id, { label, order, isActive }) => {
  const variant = await ProductVariant.findById(id);
  if (!variant) {
    throw new ApiError(404, 'Product variant not found');
  }

  if (label !== undefined) {
    const existing = await ProductVariant.findOne({ label: label.trim(), _id: { $ne: id } });
    if (existing) {
      throw new ApiError(400, 'Variant with this label already exists');
    }
    variant.label = label.trim();
  }
  if (order !== undefined) variant.order = order;
  if (isActive !== undefined) variant.isActive = Boolean(isActive);

  await variant.save();
  return variant;
};

export const deleteGlobalVariantService = async (id) => {
  const variant = await ProductVariant.findById(id);
  if (!variant) {
    throw new ApiError(404, 'Product variant not found');
  }

  const linkedCount = await ProductVariantLink.countDocuments({ productVariantId: id });
  if (linkedCount > 0) {
    throw new ApiError(400, `Cannot delete variant: It is linked to ${linkedCount} product(s).`);
  }

  await ProductVariant.deleteOne({ _id: id });
  return variant;
};
