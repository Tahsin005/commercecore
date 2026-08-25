"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Package, ShoppingCart, ShoppingBag } from "lucide-react";

import { useWishlist } from "@/hooks/useWishlist";
import { useProductsQuery } from "@/hooks/useProductQueries";
import { useProductCardActions, getProductStock, getProductDisplayPricing } from "@/hooks/useProductCardActions";
import { ProductCardImageSlider } from "@/components/ProductCardImageSlider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface RelatedProductsSectionProps {
  categoryId?: string | null;
  currentProductId: string;
}

export function RelatedProductsSection({ categoryId, currentProductId }: RelatedProductsSectionProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { isInWishlist } = useWishlist();
  const { handleAddToCart, handleBuyNow, handleToggleWishlist } = useProductCardActions();

  const { data: response, isLoading } = useProductsQuery({
    categoryId: categoryId || undefined,
    limit: 6,
  });

  const products = response?.data?.products || [];
  const relatedProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (isLoading || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6 mt-12 font-sans pt-6 border-t border-maroon-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900 tracking-tight">
            {t.productDetails?.relatedProducts || "Related Products"}
          </h2>
          <p className="text-xs text-maroon-700 mt-0.5">
            {t.productDetails?.relatedProductsDesc || "Explore other items from this category"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
        {relatedProducts.map((product) => {
          const defaultColor = (product.colors && product.colors.length > 0 && product.colors[0]) ? product.colors[0] : undefined;
          const wishlisted = isInWishlist(product.id, defaultColor);
          const {
            regularPrice,
            hasDiscount,
            discountPercent,
            effectivePrice,
          } = getProductDisplayPricing(product);
          const stock = getProductStock(product);
          const isOutOfStock = stock <= 0;

          const productId = product.id;
          const productHref = `/product/${productId}`;

          return (
            <div
              key={productId}
              className="bg-white rounded-xl shadow-xs border border-maroon-100 hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              {hasDiscount && (
                <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-mono text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md shadow-md border-2 border-white uppercase z-20 pointer-events-none">
                  {discountPercent}% {t.common?.off || "OFF"}
                </span>
              )}

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
                  className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer shadow-sm z-30 ${
                    wishlisted
                      ? "bg-maroon-900 text-cream border-maroon-800"
                      : "bg-white text-maroon-600 border-maroon-200 hover:bg-maroon-50"
                  }`}
                  title={wishlisted ? t.home.removeFromWishlist : t.home.addToWishlist}
                >
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? "fill-cream" : ""}`} />
                </button>

                {product.isFeatured && !hasDiscount && (
                  <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-maroon-900 text-cream text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-sm shadow z-30 pointer-events-none">
                    {t.common.featured}
                  </span>
                )}
              </div>

              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  {product.categoryId && typeof product.categoryId === "object" && product.categoryId.name && (
                    <div className="mb-1">
                      <span className="inline-block bg-maroon-100/70 border border-maroon-200/80 text-maroon-900 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded">
                        {product.categoryId.name}
                      </span>
                    </div>
                  )}
                  <h3 className="font-serif font-bold text-xs sm:text-base text-maroon-900 line-clamp-1 group-hover:text-maroon-700 transition-colors">
                    <Link
                      href={productHref}
                      className="hover:underline block"
                    >
                      {product.name}
                    </Link>
                  </h3>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-maroon-100 space-y-2 sm:space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] sm:text-[10px] font-semibold text-maroon-500 uppercase tracking-wider">
                      {t.common.price}
                    </span>
                    {hasDiscount ? (
                      <div className="flex items-baseline space-x-1 sm:space-x-1.5">
                        <span className="text-[10px] sm:text-[11px] font-mono text-maroon-700/60 line-through">
                          ৳{regularPrice.toFixed(2)}
                        </span>
                        <span className="text-xs sm:text-base font-bold font-mono text-maroon-900">
                          ৳{effectivePrice.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs sm:text-base font-bold font-mono text-maroon-900">
                        ৳{regularPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-off-white hover:bg-maroon-900 text-maroon-900 hover:text-cream border border-maroon-200 hover:border-maroon-900 active:scale-95 rounded-lg transition-all flex items-center justify-center shrink-0 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group/cart"
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
                      className="flex-1 h-8 sm:h-10 py-1.5 sm:py-2 px-2 sm:px-3 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-semibold text-[11px] sm:text-xs rounded-lg transition-all flex items-center justify-center space-x-1 sm:space-x-1.5 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cream shrink-0" />
                      <span className="truncate">
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
        })}
      </div>
    </div>
  );
}
