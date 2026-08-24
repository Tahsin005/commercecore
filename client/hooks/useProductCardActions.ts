"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Product, ProductVariant } from "@/hooks/useProductQueries";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { isProductOnSale, getProductEffectivePrice, getProductDiscountPercentage } from "@/lib/discount";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackAddToCart, trackAddToWishlist } from "@/lib/meta-pixel";
import { trackGaAddToCart, trackGaAddToWishlist } from "@/lib/gtag";

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
    product.variants[0] ||
    null
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
    const selectedVariant = getSelectedVariant(product);
    const defaultColor = (product.colors && product.colors.length > 0 && product.colors[0]) ? product.colors[0] : undefined;
    const defaultImage = (product.images && product.images.length > 0 && product.images[0]) ? product.images[0] : undefined;

    const regularPrice = selectedVariant?.overridePrice ?? selectedVariant?.price ?? product.price ?? product.defaultPrice ?? 0;
    const discountPrice = selectedVariant?.overrideDiscountPrice ?? selectedVariant?.discountPrice ?? product.discountPrice ?? product.defaultDiscountPrice ?? null;
    const effectivePrice = getProductEffectivePrice(regularPrice, discountPrice);

    const targetVariantId = selectedVariant?.id || product.id;
    const wishlisted = isInWishlist(targetVariantId, defaultColor);

    if (wishlisted) {
      removeFromWishlist(targetVariantId, defaultColor);
      toast.success(`"${product.name}" ${t.home.removeFromWishlist}`);
    } else {
      addToWishlist({
        productId: product.id,
        productVariantId: selectedVariant?.id,
        name: product.name,
        slug: product.slug,
        size: selectedVariant?.label || selectedVariant?.size || t.common.standard,
        color: defaultColor,
        price: effectivePrice,
        imageUrl: defaultImage,
      });
      trackAddToWishlist({
        productId: product.id,
        name: product.name,
        price: effectivePrice,
      });
      trackGaAddToWishlist({
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

    const selectedVariant = getSelectedVariant(product);
    const defaultColor = (product.colors && product.colors.length > 0 && product.colors[0]) ? product.colors[0] : undefined;
    const defaultImage = (product.images && product.images.length > 0 && product.images[0]) ? product.images[0] : undefined;

    const regularPrice = selectedVariant?.overridePrice ?? selectedVariant?.price ?? product.price ?? product.defaultPrice ?? 0;
    const discountPrice = selectedVariant?.overrideDiscountPrice ?? selectedVariant?.discountPrice ?? product.discountPrice ?? product.defaultDiscountPrice ?? null;
    const effectivePrice = getProductEffectivePrice(regularPrice, discountPrice);

    try {
      await addToCart(
        {
          productVariantId: selectedVariant?.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          size: selectedVariant?.size || selectedVariant?.label || t.common.standard,
          color: defaultColor,
          price: effectivePrice,
          imageUrl: defaultImage,
        },
        1
      );
      trackAddToCart({
        productId: product.id,
        name: product.name,
        price: effectivePrice,
        quantity: 1,
      });
      trackGaAddToCart({
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
