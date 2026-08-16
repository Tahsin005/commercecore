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
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";

import { useWishlist } from "@/hooks/useWishlist";
import { useProductsQuery, Product } from "@/hooks/useProductQueries";
import { useCategoriesQuery } from "@/hooks/useCategoryQueries";
import { useSiteSettingsQuery } from "@/hooks/useSettingsQueries";
import { getDiscountedPrice, useActiveDiscount } from "@/lib/discount";
import { HomepageBanners } from "@/components/HomepageBanners";
import { CategoriesSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 12;

  const { t } = useLanguage();
  const { data: siteSettings } = useSiteSettingsQuery();
  const discountSetting = siteSettings?.site_discount;
  const hasSitewideDiscount = useActiveDiscount(discountSetting);

  // React Query Hooks
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const discountPercentage = hasSitewideDiscount && discountSetting?.discountPercentage ? discountSetting.discountPercentage : 0;
  const discountMultiplier = discountPercentage > 0 ? (100 - discountPercentage) / 100 : 1;

  const effectiveMinPrice = minPrice !== "" ? Number(minPrice) / discountMultiplier : undefined;
  const effectiveMaxPrice = maxPrice !== "" ? Number(maxPrice) / discountMultiplier : undefined;

  const { data: response, isLoading, error } = useProductsQuery({
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    search: searchQuery,
    sortBy,
    minPrice: effectiveMinPrice,
    maxPrice: effectiveMaxPrice,
    page,
    limit,
  });

  const products = response?.data?.products || [];
  const pagination = response?.data?.pagination;
  const totalProducts = pagination?.totalProducts ?? products.length;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? page;

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPage(1);
  };

  const handleMinPriceChange = (val: string) => {
    setMinPrice(val);
    setPage(1);
  };

  const handleMaxPriceChange = (val: string) => {
    setMaxPrice(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery.trim() !== "" ||
    sortBy !== "newest" ||
    minPrice !== "" ||
    maxPrice !== "";

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
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        <HomepageBanners />

        {isCategoriesLoading ? (
          <CategoriesSkeleton />
        ) : categories.length > 0 ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900 tracking-tight">
                {t.home.categoryItems}
              </h2>
              {selectedCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => handleCategorySelect("all")}
                  className="text-xs font-semibold text-maroon-700 hover:text-maroon-900 underline cursor-pointer"
                >
                  {t.home.showAllCategories}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              <button
                type="button"
                onClick={() => handleCategorySelect("all")}
                className={`bg-white rounded-2xl border p-2.5 flex flex-col justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md ${
                  selectedCategory === "all"
                    ? "border-maroon-900 ring-2 ring-maroon-800/30 shadow-md bg-maroon-50/20"
                    : "border-maroon-100 hover:border-maroon-300"
                }`}
              >
                <div className="relative w-full aspect-square bg-off-white rounded-xl overflow-hidden flex items-center justify-center p-3 border border-maroon-100/60">
                  <div className="w-full h-full rounded-lg bg-maroon-900 flex flex-col items-center justify-center text-white space-y-1 group-hover:scale-105 transition-transform duration-300">
                    <Tag className="w-8 h-8 text-cream" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cream/90">{t.home.all}</span>
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
                    onClick={() => handleCategorySelect(cat.id)}
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
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
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

        <div className="space-y-4 border-b border-maroon-100 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-serif font-bold text-maroon-900">{t.home.productsCatalog}</h2>
              <p className="text-xs text-maroon-700">{t.home.catalogDesc}</p>
            </div>
            <span className="text-xs font-semibold text-maroon-700 bg-maroon-100 px-3 py-1.5 rounded-lg border border-maroon-200 self-start sm:self-auto">
              {isLoading ? "..." : `${totalProducts} ${t.home.itemsAvailable}`}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-maroon-100 shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="relative md:col-span-5">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder={t.home.searchPlaceholder || "Search by product title or description..."}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs placeholder-maroon-500/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-maroon-400 hover:text-maroon-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="relative md:col-span-4 flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-maroon-500">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all cursor-pointer appearance-none"
                >
                  <option value="newest">{t.home.sortNewest || "Newest First"}</option>
                  <option value="price_asc">{t.home.sortPriceLowToHigh || "Price: Low to High"}</option>
                  <option value="price_desc">{t.home.sortPriceHighToLow || "Price: High to Low"}</option>
                  <option value="oldest">{t.home.sortOldest || "Oldest First"}</option>
                  <option value="name_asc">{t.home.sortNameAsc || "Name: A to Z"}</option>
                  <option value="name_desc">{t.home.sortNameDesc || "Name: Z to A"}</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-maroon-400">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              <div className="md:col-span-3 flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                  <input
                    type="number"
                    placeholder={t.home.minPrice || "Min ৳"}
                    value={minPrice}
                    onChange={(e) => handleMinPriceChange(e.target.value)}
                    className="w-full py-2 px-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs placeholder-maroon-500/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all font-mono"
                  />
                  <span className="text-maroon-400 text-xs font-bold">-</span>
                  <input
                    type="number"
                    placeholder={t.home.maxPrice || "Max ৳"}
                    value={maxPrice}
                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                    className="w-full py-2 px-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs placeholder-maroon-500/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all font-mono"
                  />
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="p-2 bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200 rounded-xl transition-colors cursor-pointer shrink-0"
                    title={t.home.clearFilters || "Clear Filters"}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoading && <ProductGridSkeleton count={8} />}

        {error && (
          <div className="p-6 bg-maroon-100/60 border border-maroon-200 rounded-xl text-maroon-900 text-center space-y-2">
            <p className="font-semibold text-base font-serif">{t.home.unableToLoad}</p>
            <p className="text-sm text-maroon-700">{t.home.unableToLoad}</p>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="p-12 bg-white border border-maroon-100 rounded-2xl text-center space-y-3 shadow-xs">
            <Package className="w-12 h-12 text-maroon-300 mx-auto" />
            <p className="font-serif font-bold text-lg text-maroon-900">
              {t.home.noProductsFound || "No products found matching your search or filters."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-maroon-900 text-cream text-xs font-semibold rounded-xl hover:bg-maroon-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.home.clearFilters || "Clear Filters"}</span>
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="space-y-8">
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
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                        <h3 className="font-serif font-bold text-lg text-maroon-900 line-clamp-1 group-hover:text-maroon-700 transition-colors">
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
                              <span className="text-lg font-bold font-mono text-maroon-900 leading-tight">
                                ৳{getDiscountedPrice(price, discountSetting).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold font-mono text-maroon-900 leading-tight block">
                              ৳{price.toFixed(2)}
                            </span>
                          )}
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

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-maroon-100">
                <span className="text-xs font-semibold text-maroon-700">
                  {t.home.page || "Page"} <strong className="text-maroon-900 font-mono">{currentPage}</strong> {t.home.of || "of"}{" "}
                  <strong className="text-maroon-900 font-mono">{totalPages}</strong>
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1 || isLoading}
                    className="inline-flex items-center space-x-1 px-3 py-2 bg-white hover:bg-maroon-50 border border-maroon-200 disabled:opacity-40 disabled:hover:bg-white text-maroon-900 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t.home.previous || "Previous"}</span>
                  </button>

                  <div className="flex items-center space-x-1 px-2">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
                              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages || isLoading}
                    className="inline-flex items-center space-x-1 px-3 py-2 bg-white hover:bg-maroon-50 border border-maroon-200 disabled:opacity-40 disabled:hover:bg-white text-maroon-900 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{t.home.next || "Next"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
