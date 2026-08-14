import Product, { ProductVariant, ProductVariantLink } from './product.model.js';
import Category from '../category/category.model.js'; // Registers Category schema with Mongoose
import ApiError from '../../utils/ApiError.js';

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

  const variantMap = links.reduce((acc, link) => {
    const pid = link.productId.toString();
    if (!acc[pid]) acc[pid] = [];
    if (link.productVariantId) {
      const v = link.productVariantId.toJSON ? link.productVariantId.toJSON() : link.productVariantId;
      acc[pid].push({
        ...v,
        size: v.label,
      });
    }
    return acc;
  }, {});

  return products.map((p) => ({
    ...p.toJSON(),
    defaultPrice: p.price,
    variants: variantMap[p.id] || [],
  }));
};

export const getProductByIdService = async (productId) => {
  const product = await Product.findById(productId).populate('categoryId', 'name slug isFeatured');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  const links = await ProductVariantLink.find({ productId: product.id }).populate('productVariantId');
  const variants = links
    .filter((l) => l.productVariantId)
    .map((l) => {
      const v = l.productVariantId.toJSON ? l.productVariantId.toJSON() : l.productVariantId;
      return {
        ...v,
        size: v.label,
      };
    });

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
  const variants = links
    .filter((l) => l.productVariantId)
    .map((l) => {
      const v = l.productVariantId.toJSON ? l.productVariantId.toJSON() : l.productVariantId;
      return {
        ...v,
        size: v.label,
      };
    });

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
  return links
    .filter((l) => l.productVariantId)
    .map((l) => {
      const v = l.productVariantId.toJSON ? l.productVariantId.toJSON() : l.productVariantId;
      return {
        ...v,
        size: v.label,
      };
    });
};

export const getGlobalVariantsService = async () => {
  return ProductVariant.find({ isActive: true }).sort({ order: 1 });
};
