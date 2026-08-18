"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Product, ProductVariant } from "@/hooks/useProductQueries";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { getDiscountedPrice } from "@/lib/discount";
import { SiteDiscountSetting } from "@/hooks/useSettingsQueries";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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

export function useProductCardActions(
  discountSetting?: SiteDiscountSetting | null,
  hasSitewideDiscount?: boolean
) {
  const { t } = useLanguage();
  const router = useRouter();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleToggleWishlist = (product: Product) => {
    const wishlisted = isInWishlist(product.id);
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const price = product.price !== undefined && product.price !== null ? product.price : (product.defaultPrice || 0);

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
        price,
        imageUrl: product.images?.[0],
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
    const basePrice = product.price !== undefined && product.price !== null ? product.price : (product.defaultPrice || 0);
    const effectivePrice = hasSitewideDiscount
      ? getDiscountedPrice(basePrice, discountSetting)
      : (v?.overridePrice ?? v?.price ?? basePrice);

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
