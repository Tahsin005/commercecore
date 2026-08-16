"use client";

import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Heart, Package, Eye } from "lucide-react";

import { useWishlist } from "@/hooks/useWishlist";
import { useProductsQuery, Product } from "@/hooks/useProductQueries";
import { useSiteSettingsQuery } from "@/hooks/useSettingsQueries";
import { getDiscountedPrice, useActiveDiscount } from "@/lib/discount";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface RelatedProductsSectionProps {
  categoryId?: string | null;
  currentProductId: string;
}

export function RelatedProductsSection({ categoryId, currentProductId }: RelatedProductsSectionProps) {
  const { t } = useLanguage();
  const { data: siteSettings } = useSiteSettingsQuery();
  const discountSetting = siteSettings?.site_discount;
  const hasSitewideDiscount = useActiveDiscount(discountSetting);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

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

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md border border-maroon-100 overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div className="bg-off-white p-6 relative flex items-center justify-center border-b border-maroon-100/60 h-48 overflow-hidden">
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
                  onClick={() => handleToggleWishlist(product)}
                  className={`absolute top-3 right-3 p-2 rounded-full border transition-all cursor-pointer shadow-sm ${
                    wishlisted
                      ? "bg-maroon-900 text-cream border-maroon-800"
                      : "bg-white text-maroon-600 border-maroon-200 hover:bg-maroon-50"
                  }`}
                  title={wishlisted ? t.home.removeFromWishlist : t.home.addToWishlist}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? "fill-cream" : ""}`} />
                </button>

                {product.categoryId && (
                  <span className="absolute bottom-3 left-3 bg-white/90 border border-maroon-200 text-maroon-800 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                    {product.categoryId.name}
                  </span>
                )}

                {hasSitewideDiscount ? (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow">
                    {discountSetting?.discountPercentage}% OFF
                  </span>
                ) : product.isFeatured ? (
                  <span className="absolute top-3 left-3 bg-maroon-900 text-cream text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow">
                    {t.common.featured}
                  </span>
                ) : null}
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-maroon-900 line-clamp-1 group-hover:text-maroon-700 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-maroon-700/80 line-clamp-2 mt-1 font-sans">
                    {product.description || t.home.noDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-maroon-100 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-maroon-500 uppercase tracking-wider block mb-0.5">
                      {t.common.price}
                    </span>
                    {hasSitewideDiscount ? (
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-maroon-700/60 line-through leading-none mb-0.5">
                          ৳{price.toFixed(2)}
                        </span>
                        <span className="text-base font-bold font-mono text-maroon-900 leading-tight">
                          ৳{getDiscountedPrice(price, discountSetting).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-base font-bold font-mono text-maroon-900 leading-tight block">
                        ৳{price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/product/${product.id}`}
                    className="px-3 py-1.5 bg-maroon-900 hover:bg-maroon-800 active:scale-95 text-white font-medium text-xs rounded-md transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
                    title={t.common.viewDetails}
                  >
                    <Eye className="w-3.5 h-3.5 text-cream" />
                    <span>{t.common.viewDetails}</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
