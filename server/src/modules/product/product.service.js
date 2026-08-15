import mongoose from 'mongoose';
import Product, { ProductVariant, ProductVariantLink } from './product.model.js';
import Category from '../category/category.model.js';
import { CartItem } from '../cart/cart.model.js';
import { WishlistItem } from '../wishlist/wishlist.model.js';
import ApiError from '../../utils/ApiError.js';

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

const processAndSortVariants = (links) => {
  return links
    .filter((l) => l.productVariantId && l.productVariantId.isActive === true)
    .map((l) => {
      const v = l.productVariantId.toJSON ? l.productVariantId.toJSON() : l.productVariantId;
      return {
        ...v,
        size: v.label,
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
  return link.productVariantId;
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

  const products = await Product.find(filter)
    .populate('categoryId', 'name slug isFeatured')
    .sort({ createdAt: -1 });

  const productIds = products.map((p) => p.id);
  const links = await ProductVariantLink.find({ productId: { $in: productIds } })
    .populate('productVariantId');

  const linksByProduct = links.reduce((acc, link) => {
    const pid = link.productId.toString();
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(link);
    return acc;
  }, {});

  return products.map((p) => ({
    ...p.toJSON(),
    defaultPrice: p.price,
    variants: processAndSortVariants(linksByProduct[p.id] || []),
  }));
};

export const getProductByIdService = async (productId) => {
  const product = await Product.findById(productId).populate('categoryId', 'name slug isFeatured');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  const links = await ProductVariantLink.find({ productId: product.id }).populate('productVariantId');
  const variants = processAndSortVariants(links);

  return {
    ...product.toJSON(),
    defaultPrice: product.price,
    variants,
  };
};

export const getProductBySlugService = async (slug) => {
  const product = await Product.findOne({ slug }).populate('categoryId', 'name slug isFeatured');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  const links = await ProductVariantLink.find({ productId: product.id }).populate('productVariantId');
  const variants = processAndSortVariants(links);

  return {
    ...product.toJSON(),
    defaultPrice: product.price,
    variants,
  };
};

export const getProductVariantsService = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  const links = await ProductVariantLink.find({ productId: product.id }).populate('productVariantId');
  return processAndSortVariants(links);
};

export const getGlobalVariantsService = async (includeAll = false) => {
  const filter = includeAll ? {} : { isActive: true };
  return ProductVariant.find(filter).sort({ order: 1 });
};

// Admin CRUD Services
export const createProductService = async ({
  name,
  slug,
  code = '',
  categoryId = null,
  description = '',
  price,
  quantity = 0,
  isFeatured = false,
  isActive = true,
  variantIds = [],
}) => {
  const finalSlug = generateSlug(slug || name);
  if (!finalSlug) {
    throw new ApiError(400, 'Invalid product name or slug');
  }

  await validateAndVerifyVariantIds(variantIds);

  const existing = await Product.findOne({ slug: finalSlug });
  if (existing) {
    throw new ApiError(400, 'Product with this slug already exists');
  }

  if (categoryId) {
    const categoryObj = await Category.findById(categoryId);
    if (!categoryObj) {
      throw new ApiError(404, 'Selected category does not exist');
    }
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
    const [product] = await Product.create(
      [
        {
          name,
          slug: finalSlug,
          code,
          categoryId: categoryId || null,
          description,
          price,
          quantity,
          isFeatured: Boolean(isFeatured),
          isActive: Boolean(isActive),
        },
      ],
      opts
    );

    if (Array.isArray(variantIds) && variantIds.length > 0) {
      const linkDocs = variantIds.map((vId) => ({
        productId: product.id,
        productVariantId: vId,
      }));
      await ProductVariantLink.insertMany(linkDocs, opts);
    }

    if (useTransaction && session) {
      await session.commitTransaction();
    }
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
    quantity,
    isFeatured,
    isActive,
    variantIds,
  }
) => {
  if (Array.isArray(variantIds)) {
    await validateAndVerifyVariantIds(variantIds);
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
    const product = await Product.findById(id).session(session || null);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (name !== undefined) product.name = name;
    if (code !== undefined) product.code = code;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    if (categoryId !== undefined) {
      if (categoryId) {
        const categoryObj = await Category.findById(categoryId).session(session || null);
        if (!categoryObj) {
          throw new ApiError(404, 'Selected category does not exist');
        }
        product.categoryId = categoryId;
      } else {
        product.categoryId = null;
      }
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

    await product.save(opts);

    if (Array.isArray(variantIds)) {
      await ProductVariantLink.deleteMany({ productId: id }, opts);
      if (variantIds.length > 0) {
        const linkDocs = variantIds.map((vId) => ({
          productId: id,
          productVariantId: vId,
        }));
        await ProductVariantLink.insertMany(linkDocs, opts);
      }
    }

    if (useTransaction && session) {
      await session.commitTransaction();
    }
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
