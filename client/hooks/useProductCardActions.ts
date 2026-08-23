"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Product, ProductVariant } from "@/hooks/useProductQueries";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { isProductOnSale, getProductEffectivePrice, getProductDiscountPercentage } from "@/lib/discount";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackAddToCart, trackAddToWishlist } from "@/lib/meta-pixel";

export function getProductStock(product: Product): number {
  if (product.variants && product.variants.length > 0) {
    const activeVariants = product.variants.filter((v) => v.isActive !== false);
    if (activeVariants.length > 0) {
      return activeVariants.reduce((sum, v) => sum + (v.quantity ?? 0), 0);
    }
  }
  return product.quantity ?? 0;
}

export function getSelectedVariant(product: Product): ProductVariant | null {
  if (!product.variants || product.variants.length === 0) return null;
  return (
    product.variants.find((v) => v.isActive !== false && (v.quantity ?? 0) > 0) ||
    product.variants.find((v) => v.isActive !== false) ||
    product.variants[0]
  );
}

export function getProductDisplayPricing(product: Product) {
  const v = getSelectedVariant(product);
  const regularPrice = v?.overridePrice ?? v?.price ?? product.price ?? product.defaultPrice ?? 0;
  const discountPrice = v?.overrideDiscountPrice ?? v?.discountPrice ?? product.discountPrice ?? product.defaultDiscountPrice ?? null;
  const hasDiscount = isProductOnSale(regularPrice, discountPrice);
  const discountPercent = getProductDiscountPercentage(regularPrice, discountPrice);
  const effectivePrice = getProductEffectivePrice(regularPrice, discountPrice);

  return {
    selectedVariant: v,
    regularPrice,
    discountPrice,
    hasDiscount,
    discountPercent,
    effectivePrice,
  };
}

export function useProductCardActions() {
  const { t } = useLanguage();
  const router = useRouter();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleToggleWishlist = (product: Product) => {
    const wishlisted = isInWishlist(product.id);
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const regularPrice = defaultVariant?.overridePrice ?? defaultVariant?.price ?? product.price ?? product.defaultPrice ?? 0;
    const discountPrice = defaultVariant?.overrideDiscountPrice ?? defaultVariant?.discountPrice ?? product.discountPrice ?? product.defaultDiscountPrice ?? null;
    const effectivePrice = getProductEffectivePrice(regularPrice, discountPrice);

    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.success(`"${product.name}" ${t.home.removeFromWishlist}`);
    } else {
      addToWishlist({
        productId: product.id,
        productVariantId: defaultVariant?.id,
        name: product.name,
        slug: product.slug,
        size: defaultVariant?.label || defaultVariant?.size || t.common.standard,
        price: effectivePrice,
        imageUrl: product.images?.[0],
      });
      trackAddToWishlist({
        productId: product.id,
        name: product.name,
        price: effectivePrice,
      });
      toast.success(`"${product.name}" ${t.home.addToWishlist}`);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product): Promise<boolean> => {
    e.stopPropagation();
    e.preventDefault();

    const stock = getProductStock(product);
    if (stock <= 0) {
      toast.error(t.productDetails?.outOfStockMsg || "Product is out of stock");
      return false;
    }

    const v = getSelectedVariant(product);
    const regularPrice = v?.overridePrice ?? v?.price ?? product.price ?? product.defaultPrice ?? 0;
    const discountPrice = v?.overrideDiscountPrice ?? v?.discountPrice ?? product.discountPrice ?? product.defaultDiscountPrice ?? null;
    const effectivePrice = getProductEffectivePrice(regularPrice, discountPrice);

    try {
      await addToCart(
        {
          productVariantId: v?.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          size: v?.size || v?.label || t.common.standard,
          price: effectivePrice,
          imageUrl: product.images?.[0],
        },
        1
      );
      trackAddToCart({
        productId: product.id,
        name: product.name,
        price: effectivePrice,
        quantity: 1,
      });
      toast.success(t.productDetails?.addedToCart || "Added to cart!");
      return true;
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || t.common?.error || "Failed to add item to cart";
      toast.error(errorMsg);
      return false;
    }
  };

  const handleBuyNow = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    const success = await handleAddToCart(e, product);
    if (success) {
      router.push("/checkout");
    }
  };

  return {
    handleAddToCart,
    handleBuyNow,
    handleToggleWishlist,
  };
}
