/**
 * Product-based discount utility functions.
 */

/**
 * Checks if a product or variant is currently on sale.
 */
export function isProductOnSale(
  regularPrice: number,
  discountPrice?: number | null
): boolean {
  if (discountPrice === undefined || discountPrice === null || discountPrice <= 0) {
    return false;
  }
  return discountPrice < regularPrice;
}

/**
 * Returns the effective selling price for a product or variant.
 */
export function getProductEffectivePrice(
  regularPrice: number,
  discountPrice?: number | null
): number {
  if (isProductOnSale(regularPrice, discountPrice)) {
    return discountPrice!;
  }
  return regularPrice;
}

/**
 * Returns the discount percentage rounded to the nearest integer (e.g. 20 for 20% off).
 */
export function getProductDiscountPercentage(
  regularPrice: number,
  discountPrice?: number | null
): number {
  if (!isProductOnSale(regularPrice, discountPrice) || regularPrice <= 0) {
    return 0;
  }
  const diff = regularPrice - discountPrice!;
  return Math.round((diff / regularPrice) * 100);
}

/**
 * Returns the amount saved in currency units (e.g. 250 for ৳250 savings).
 */
export function getProductSavings(
  regularPrice: number,
  discountPrice?: number | null
): number {
  if (!isProductOnSale(regularPrice, discountPrice)) {
    return 0;
  }
  return Math.max(0, Math.round((regularPrice - discountPrice!) * 100) / 100);
}
