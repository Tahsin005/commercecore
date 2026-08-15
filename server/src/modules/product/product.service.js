import Product, { ProductVariant, ProductVariantLink } from './product.model.js';
import Category from '../category/category.model.js'; // Registers Category schema with Mongoose
import ApiError from '../../utils/ApiError.js';

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

export const getGlobalVariantsService = async () => {
  return ProductVariant.find({ isActive: true }).sort({ order: 1 });
};
