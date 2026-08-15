"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Heart,
  Package,
  Eye,
  Tag,
} from "lucide-react";

import { useWishlist } from "@/hooks/useWishlist";
import { useProductsQuery, Product } from "@/hooks/useProductQueries";
import { useCategoriesQuery } from "@/hooks/useCategoryQueries";
import { CategoriesSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { t } = useLanguage();

  // react Query Hooks
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const { data: response, isLoading, error } = useProductsQuery(
    selectedCategory !== "all" ? selectedCategory : undefined
  );
  const products = response?.data || [];

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

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
      });
      toast.success(`"${product.name}" ${t.home.addToWishlist}`);
    }
  };

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-maroon-100/80 bg-maroon-900 group">
          <Image
            src="/banner.png"
            alt="Rupzone Collection Banner"
            width={1200}
            height={450}
            className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
            priority
          />
        </div>

        {isCategoriesLoading ? (
          <CategoriesSkeleton />
        ) : categories.length > 0 ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900 tracking-tight">
                Category Items
              </h2>
              {selectedCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs font-semibold text-maroon-700 hover:text-maroon-900 underline cursor-pointer"
                >
                  Show All Categories
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`bg-white rounded-2xl border p-2.5 flex flex-col justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md ${
                  selectedCategory === "all"
                    ? "border-maroon-900 ring-2 ring-maroon-800/30 shadow-md bg-maroon-50/20"
                    : "border-maroon-100 hover:border-maroon-300"
                }`}
              >
                <div className="relative w-full aspect-square bg-off-white rounded-xl overflow-hidden flex items-center justify-center p-3 border border-maroon-100/60">
                  <div className="w-full h-full rounded-lg bg-maroon-900 flex flex-col items-center justify-center text-white space-y-1 group-hover:scale-105 transition-transform duration-300">
                    <Tag className="w-8 h-8 text-cream" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cream/90">All</span>
                  </div>
                </div>
                <div className="pt-2.5 pb-1 px-1 text-center">
                  <span className="font-serif font-bold text-xs sm:text-sm text-maroon-900 group-hover:text-maroon-700 block truncate">
                    {t.home.allProducts}
                  </span>
                </div>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`bg-white rounded-2xl border p-2.5 flex flex-col justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md ${
                      isSelected
                        ? "border-maroon-900 ring-2 ring-maroon-800/30 shadow-md bg-maroon-50/20"
                        : "border-maroon-100 hover:border-maroon-300"
                    }`}
                  >
                    <div className="relative w-full aspect-square bg-off-white rounded-xl overflow-hidden flex items-center justify-center border border-maroon-100/60">
                      {cat.imageUrl ? (
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-maroon-50/50 flex flex-col items-center justify-center text-maroon-300">
                          <Tag className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      )}

                      {cat.isFeatured && (
                        <span className="absolute top-2 left-2 bg-maroon-900 text-cream text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                          {t.common.featured}
                        </span>
                      )}
                    </div>

                    <div className="pt-2.5 pb-1 px-1 text-center">
                      <span className="font-serif font-bold text-xs sm:text-sm text-maroon-900 group-hover:text-maroon-700 block truncate">
                        {cat.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-b border-maroon-100 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-maroon-900">{t.home.productsCatalog}</h2>
            <p className="text-xs text-maroon-700">{t.home.catalogDesc}</p>
          </div>
          <span className="text-xs font-semibold text-maroon-600 bg-maroon-100 px-3 py-1 rounded-sm">
            {isLoading ? "..." : `${products.length} ${t.home.itemsAvailable}`}
          </span>
        </div>

        {isLoading && <ProductGridSkeleton count={8} />}

        {error && (
          <div className="p-6 bg-maroon-100/60 border border-maroon-200 rounded-xl text-maroon-900 text-center space-y-2">
            <p className="font-semibold text-base font-serif">{t.home.unableToLoad}</p>
            <p className="text-sm text-maroon-700">{t.home.unableToLoad}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
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
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-maroon-300 group-hover:scale-110 transition-transform duration-300" />
                    )}
                    
                    <button
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

                    {product.isFeatured && (
                      <span className="absolute top-3 left-3 bg-maroon-900 text-cream text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow">
                        {t.common.featured}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-maroon-900 line-clamp-1 group-hover:text-maroon-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-maroon-700/80 line-clamp-2 mt-1 font-sans">
                        {product.description || t.home.noDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-maroon-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-maroon-500 uppercase tracking-wider block">
                          {t.common.price}
                        </span>
                        <span className="text-lg font-bold font-mono text-maroon-900">
                          ৳{price.toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/product/${product.id}`}
                        className="px-3.5 py-2 bg-maroon-900 hover:bg-maroon-800 active:scale-95 text-white font-medium text-xs rounded-md transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
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
        )}
      </main>
    </div>
  );
}
