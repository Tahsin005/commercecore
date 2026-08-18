"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Package, ShoppingCart, ShoppingBag } from "lucide-react";

import { useWishlist } from "@/hooks/useWishlist";
import { useProductsQuery } from "@/hooks/useProductQueries";
import { useProductCardActions, getProductStock } from "@/hooks/useProductCardActions";
import { useSiteSettingsQuery } from "@/hooks/useSettingsQueries";
import { getDiscountedPrice, useActiveDiscount } from "@/lib/discount";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface RelatedProductsSectionProps {
  categoryId?: string | null;
  currentProductId: string;
}

export function RelatedProductsSection({ categoryId, currentProductId }: RelatedProductsSectionProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: siteSettings } = useSiteSettingsQuery();
  const discountSetting = siteSettings?.site_discount;
  const hasSitewideDiscount = useActiveDiscount(discountSetting);
  const { isInWishlist } = useWishlist();

  const { handleAddToCart, handleBuyNow, handleToggleWishlist } = useProductCardActions(
    discountSetting,
    hasSitewideDiscount
  );

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
          const wishlisted = isInWishlist(product.id);
          const price = product.price !== undefined && product.price !== null ? product.price : (product.defaultPrice || 0);
          const hasImage = Boolean(product.images && product.images.length > 0);
          const stock = getProductStock(product);
          const isOutOfStock = stock <= 0;

          return (
            <div
              key={product.id}
              onClick={() => router.push(`/product/${product.id}`)}
              className="bg-white rounded-xl shadow-md border border-maroon-100 hover:shadow-xl transition-all flex flex-col justify-between group relative cursor-pointer"
            >
              {hasSitewideDiscount && (
                <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-mono text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md shadow-md border-2 border-white uppercase z-20 pointer-events-none">
                  {discountSetting?.discountPercentage}% {t.common?.off || "OFF"}
                </span>
              )}

              <div className="bg-off-white p-6 relative flex items-center justify-center border-b border-maroon-100/60 h-48 overflow-hidden rounded-t-xl">
                {hasImage ? (
                  <Image
                    src={product.images![0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Package className="w-16 h-16 text-maroon-300 group-hover:scale-110 transition-transform duration-300" />
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(product);
                  }}
                  className={`absolute top-3 left-3 p-2 rounded-full border transition-all cursor-pointer shadow-sm z-10 ${
                    wishlisted
                      ? "bg-maroon-900 text-cream border-maroon-800"
                      : "bg-white text-maroon-600 border-maroon-200 hover:bg-maroon-50"
                  }`}
                  title={wishlisted ? t.home.removeFromWishlist : t.home.addToWishlist}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? "fill-cream" : ""}`} />
                </button>

                {product.isFeatured && !hasSitewideDiscount && (
                  <span className="absolute top-3 right-3 bg-maroon-900 text-cream text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow z-10">
                    {t.common.featured}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  {product.categoryId && typeof product.categoryId === "object" && product.categoryId.name && (
                    <div className="mb-1">
                      <span className="inline-block bg-maroon-100/70 border border-maroon-200/80 text-maroon-900 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded">
                        {product.categoryId.name}
                      </span>
                    </div>
                  )}
                  <h3 className="font-serif font-bold text-base text-maroon-900 line-clamp-1 group-hover:text-maroon-700 transition-colors">
                    <Link
                      href={`/product/${product.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {product.name}
                    </Link>
                  </h3>
                </div>

                <div className="pt-3 border-t border-maroon-100 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-semibold text-maroon-500 uppercase tracking-wider">
                      {t.common.price}
                    </span>
                    {hasSitewideDiscount ? (
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-[11px] font-mono text-maroon-700/60 line-through">
                          ৳{price.toFixed(2)}
                        </span>
                        <span className="text-base font-bold font-mono text-maroon-900">
                          ৳{getDiscountedPrice(price, discountSetting).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-base font-bold font-mono text-maroon-900">
                        ৳{price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => handleAddToCart(e, product)}
                      className="py-2 px-2 bg-maroon-800 hover:bg-maroon-700 active:scale-95 text-white font-semibold text-[11px] rounded-md transition-all flex items-center justify-center space-x-1 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-cream shrink-0" />
                      <span className="truncate">
                        {isOutOfStock
                          ? t.productDetails?.outOfStockMsg || t.common?.outOfStock || "Out of Stock"
                          : t.productDetails?.addToCart || "Add to Cart"}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => handleBuyNow(e, product)}
                      className="py-2 px-2 bg-maroon-900 hover:bg-maroon-800 active:scale-95 text-white font-semibold text-[11px] rounded-md transition-all flex items-center justify-center space-x-1 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-cream shrink-0" />
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
