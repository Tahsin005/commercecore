"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { Product } from "@/hooks/useProductQueries";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useWishlist } from "@/hooks/useWishlist";
import {
  useProductCardActions,
  getProductStock,
  getProductDisplayPricing,
  getSelectedVariant,
} from "@/hooks/useProductCardActions";
import { ProductCardImageSlider } from "@/components/ProductCardImageSlider";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t } = useLanguage();
  const { isInWishlist } = useWishlist();
  const { handleAddToCart, handleBuyNow, handleToggleWishlist } = useProductCardActions();

  const selectedVariant = getSelectedVariant(product);
  const defaultColor =
    product.colors && product.colors.length > 0 && product.colors[0]
      ? product.colors[0]
      : undefined;
  const targetWishlistId = selectedVariant?.id || product.id;
  const wishlisted = isInWishlist(targetWishlistId, defaultColor) || isInWishlist(product.id, defaultColor);

  const { regularPrice, hasDiscount, discountPercent, effectivePrice } =
    getProductDisplayPricing(product);

  const stock = getProductStock(product);
  const isOutOfStock = stock <= 0;

  const productId = product.id;
  const productHref = `/product/${productId}`;

  return (
    <div
      className={`bg-white rounded-xl shadow-xs border border-maroon-100 hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden ${
        className || ""
      }`}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <ProductCardImageSlider
          images={product.images}
          productName={product.name}
          productHref={productHref}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleToggleWishlist(product);
          }}
          className={`absolute top-2 left-2 sm:top-2.5 sm:left-2.5 p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer shadow-sm z-30 ${
            wishlisted
              ? "bg-maroon-900 text-cream border-maroon-800"
              : "bg-white/95 backdrop-blur-xs text-maroon-600 border-maroon-200 hover:bg-white hover:text-maroon-900"
          }`}
          title={
            wishlisted
              ? t.home?.removeFromWishlist || "Remove from Wishlist"
              : t.home?.addToWishlist || "Add to Wishlist"
          }
          aria-label={
            wishlisted
              ? t.home?.removeFromWishlist || "Remove from Wishlist"
              : t.home?.addToWishlist || "Add to Wishlist"
          }
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? "fill-cream" : ""}`} />
        </button>

        {hasDiscount && (
          <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-mono text-[9px] sm:text-[10px] font-black tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md shadow-md border border-white/80 uppercase z-30 pointer-events-none">
            {discountPercent}% {t.common?.off || "OFF"}
          </span>
        )}

        {product.isFeatured && !hasDiscount && (
          <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-maroon-900 text-cream text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs z-30 pointer-events-none">
            {t.common?.featured || "HOT"}
          </span>
        )}
      </div>

      <div className="p-3 sm:p-3.5 space-y-2 sm:space-y-2.5 flex-1 flex flex-col justify-between">
        <div>
          {product.categoryId &&
            typeof product.categoryId === "object" &&
            product.categoryId.name && (
              <div className="mb-0.5 sm:mb-1">
                <span className="inline-block bg-maroon-100/70 border border-maroon-200/80 text-maroon-900 text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded">
                  {product.categoryId.name}
                </span>
              </div>
            )}
          <h3 className="font-serif font-bold text-xs sm:text-sm text-maroon-900 line-clamp-1 group-hover:text-maroon-700 transition-colors">
            <Link href={productHref} className="hover:underline block" title={product.name}>
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="pt-2 border-t border-maroon-100 space-y-2">
          <div className="flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-[9px] sm:text-[10px] font-semibold text-maroon-500 uppercase tracking-wider shrink-0">
              {t.common?.price || "মূল্য"}
            </span>
            {hasDiscount ? (
              <div className="flex items-baseline space-x-1 sm:space-x-1.5 shrink-0">
                <span className="text-[10px] sm:text-[11px] font-mono text-maroon-700/60 line-through">
                  ৳{regularPrice.toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm md:text-base font-bold font-mono text-maroon-900">
                  ৳{effectivePrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm md:text-base font-bold font-mono text-maroon-900 shrink-0">
                ৳{regularPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => handleAddToCart(e, product)}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 bg-off-white hover:bg-maroon-900 text-maroon-900 hover:text-cream border border-maroon-200 hover:border-maroon-900 active:scale-95 rounded-lg transition-all flex items-center justify-center shrink-0 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group/cart"
              title={
                isOutOfStock
                  ? t.productDetails?.outOfStockMsg || t.common?.outOfStock || "Out of Stock"
                  : t.productDetails?.addToCart || "Add to Cart"
              }
              aria-label={t.productDetails?.addToCart || "Add to Cart"}
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/cart:scale-110 text-maroon-800 group-hover/cart:text-cream" />
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => handleBuyNow(e, product)}
              className="flex-1 min-w-0 h-8.5 sm:h-9 py-1 px-2 sm:px-2.5 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-semibold text-[10.5px] sm:text-xs rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cream shrink-0" />
              <span className="truncate whitespace-nowrap">
                {isOutOfStock
                  ? t.productDetails?.outOfStockMsg || t.common?.outOfStock || "Out of Stock"
                  : t.productDetails?.orderNow || "Buy Now"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
