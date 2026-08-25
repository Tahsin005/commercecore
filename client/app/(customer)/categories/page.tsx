"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Package,
  Tag,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Layers,
  Sparkles,
  ListFilter,
} from "lucide-react";

import { useProductsQuery } from "@/hooks/useProductQueries";
import { useCategoriesQuery } from "@/hooks/useCategoryQueries";
import { CategoriesSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { ProductCard } from "@/components/ProductCard";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 12;

  const { t } = useLanguage();

  // React Query Hooks
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  // Sort categories: featured first
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [categories]);

  const { data: response, isLoading, error } = useProductsQuery({
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery,
    sortBy,
    minPrice: appliedMinPrice !== "" ? appliedMinPrice : undefined,
    maxPrice: appliedMaxPrice !== "" ? appliedMaxPrice : undefined,
    page,
    limit,
  });

  const products = response?.data?.products || [];
  const pagination = response?.data?.pagination;
  const minBound = response?.data?.priceBounds?.minPrice ?? 10;
  const maxBound = response?.data?.priceBounds?.maxPrice ?? 99999;
  const totalProducts = pagination?.totalProducts ?? products.length;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? page;

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

  const [isPricePopoverOpen, setIsPricePopoverOpen] = useState<boolean>(false);
  const pricePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pricePopoverRef.current && !pricePopoverRef.current.contains(e.target as Node)) {
        setIsPricePopoverOpen(false);
      }
    };
    if (isPricePopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPricePopoverOpen]);

  const handleApplyFilters = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setPage(1);
    setIsPricePopoverOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setPage(1);
    setIsPricePopoverOpen(false);
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery.trim() !== "" ||
    sortBy !== "newest" ||
    appliedMinPrice !== "" ||
    appliedMaxPrice !== "";

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-6 flex-1 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-maroon-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-maroon-800">
              <Layers className="w-5 h-5 text-maroon-700" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-900 tracking-tight">
                {t.navbar.categories || "Categories"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-maroon-700 mt-1">
              {t.home.categoriesPageDesc || "Browse all store categories and filter products with custom search and price criteria"}
            </p>
          </div>
          <span className="text-xs font-semibold text-maroon-700 bg-maroon-100 px-3.5 py-1.5 rounded-xl border border-maroon-200 shrink-0 self-start sm:self-auto">
            {isLoading ? "..." : `${totalProducts} ${t.home.itemsAvailable}`}
          </span>
        </div>

        {isCategoriesLoading ? (
          <CategoriesSkeleton />
        ) : sortedCategories.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-maroon-900 tracking-tight">
                {t.home.browseCategories || "All Categories"} ({sortedCategories.length})
              </h2>
              {selectedCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => handleCategorySelect("all")}
                  className="text-xs font-semibold text-maroon-700 hover:text-maroon-900 underline cursor-pointer"
                >
                  {t.home.showAllCategories || "Show All Categories"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handleCategorySelect("all")}
                className={`bg-white rounded-2xl border p-2 sm:p-2.5 flex flex-col justify-center sm:justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md ${
                  selectedCategory === "all"
                    ? "border-maroon-900 ring-2 ring-maroon-800/30 shadow-md bg-maroon-50/20"
                    : "border-maroon-100 hover:border-maroon-300"
                }`}
              >
                <div className="hidden sm:flex relative w-full aspect-square bg-off-white rounded-xl overflow-hidden items-center justify-center p-3 border border-maroon-100/60">
                  <div className="w-full h-full rounded-lg bg-maroon-900 flex flex-col items-center justify-center text-white space-y-1 group-hover:scale-105 transition-transform duration-300">
                    <Tag className="w-7 h-7 text-cream" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cream/90">{t.home.all}</span>
                  </div>
                </div>
                <div className="py-1 sm:pt-2.5 sm:pb-1 px-1 text-center">
                  <span className="font-serif font-bold text-xs text-maroon-900 group-hover:text-maroon-700 block truncate">
                    {t.home.allProducts}
                  </span>
                </div>
              </button>

              {sortedCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`bg-white rounded-2xl border p-2 sm:p-2.5 flex flex-col justify-center sm:justify-between transition-all cursor-pointer group shadow-xs hover:shadow-md ${
                      isSelected
                        ? "border-maroon-900 ring-2 ring-maroon-800/30 shadow-md bg-maroon-50/20"
                        : "border-maroon-100 hover:border-maroon-300"
                    }`}
                  >
                    <div className="hidden sm:flex relative w-full aspect-square bg-off-white rounded-xl overflow-hidden items-center justify-center border border-maroon-100/60">
                      {cat.imageUrl ? (
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-maroon-50/50 flex flex-col items-center justify-center text-maroon-300">
                          <Tag className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      )}

                      {cat.isFeatured && (
                        <span className="absolute top-1.5 left-1.5 bg-maroon-900 text-cream text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-xs">
                          {t.common.featured}
                        </span>
                      )}
                    </div>

                    <div className="py-1 sm:pt-2 sm:pb-0.5 px-1 text-center flex items-center justify-center space-x-1">
                      <span className="font-serif font-bold text-xs text-maroon-900 group-hover:text-maroon-700 block truncate">
                        {cat.name}
                      </span>
                      {cat.isFeatured && (
                        <span className="sm:hidden bg-maroon-900 text-cream text-[8px] font-bold px-1 py-0.2 rounded shrink-0">
                          ★
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-maroon-100 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={t.home.searchPlaceholder || "Search by product title or description..."}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs placeholder-maroon-500/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all font-medium h-11 shadow-2xs"
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

            <div className="relative w-full md:w-56 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-maroon-500">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all cursor-pointer appearance-none h-11 shadow-2xs"
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

            <div className="relative w-full md:w-auto shrink-0" ref={pricePopoverRef}>
              <button
                type="button"
                onClick={() => setIsPricePopoverOpen((prev) => !prev)}
                className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between md:justify-center space-x-2.5 border h-11 shadow-2xs ${
                  appliedMinPrice !== "" || appliedMaxPrice !== ""
                    ? "bg-maroon-900 text-cream border-maroon-900 shadow-xs"
                    : isPricePopoverOpen
                    ? "bg-maroon-50 text-maroon-900 border-maroon-300 ring-2 ring-maroon-800/20"
                    : "bg-off-white hover:bg-maroon-50 text-maroon-900 border-maroon-200"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${appliedMinPrice !== "" || appliedMaxPrice !== "" ? "text-cream" : "text-maroon-700"}`} />
                  <span>
                    {appliedMinPrice !== "" || appliedMaxPrice !== ""
                      ? `৳${Number(appliedMinPrice || minBound).toLocaleString()} - ৳${Number(appliedMaxPrice || maxBound).toLocaleString()}`
                      : t.home.priceFilter || "Price Range"}
                  </span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isPricePopoverOpen ? "-rotate-90" : "rotate-90"} ${appliedMinPrice !== "" || appliedMaxPrice !== "" ? "text-cream/80" : "text-maroon-500"}`} />
              </button>

              {isPricePopoverOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl border border-maroon-100 shadow-2xl p-5 z-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-maroon-100">
                    <span className="font-serif font-bold text-xs text-maroon-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-maroon-700" />
                      <span>{t.home.priceFilter || "Price Range"}</span>
                    </span>
                    {(minPrice !== "" || maxPrice !== "" || appliedMinPrice !== "" || appliedMaxPrice !== "") && (
                      <button
                        type="button"
                        onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                          setAppliedMinPrice("");
                          setAppliedMaxPrice("");
                          setPage(1);
                        }}
                        className="text-[10px] font-bold text-maroon-600 hover:text-maroon-900 cursor-pointer underline"
                      >
                        {t.home.clearFilters || "Reset"}
                      </button>
                    )}
                  </div>

                  <PriceRangeSlider
                    minBound={minBound}
                    maxBound={maxBound}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    showPresets={true}
                    onChange={(min, max) => {
                      setMinPrice(min);
                      setMaxPrice(max);
                    }}
                  />

                  <div className="pt-2 border-t border-maroon-100 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      className="flex-1 py-2.5 bg-maroon-900 hover:bg-maroon-800 text-cream font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                    >
                      <ListFilter className="w-3.5 h-3.5" />
                      <span>{t.home.applyFilters || "Apply Filters"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2.5 bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200 rounded-xl transition-colors cursor-pointer shrink-0 h-11 flex items-center justify-center shadow-2xs"
                title={t.home.clearFilters || "Clear Filters"}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-maroon-100">
              <span className="text-[11px] font-bold text-maroon-600 uppercase tracking-wider">
                {t.home?.filtersLabel || "Filters:"}
              </span>
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-maroon-900 text-cream text-xs rounded-full shadow-2xs">
                  <span>{sortedCategories.find((c) => c.id === selectedCategory)?.name || "Category"}</span>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("all")}
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {appliedMinPrice !== "" && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-maroon-800 text-cream text-xs rounded-full shadow-2xs">
                  <span>{t.home?.minPrice || "Min"}: ৳{appliedMinPrice}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice("");
                      setAppliedMinPrice("");
                      setPage(1);
                    }}
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {appliedMaxPrice !== "" && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-maroon-800 text-cream text-xs rounded-full shadow-2xs">
                  <span>{t.home?.maxPrice || "Max"}: ৳{appliedMaxPrice}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMaxPrice("");
                      setAppliedMaxPrice("");
                      setPage(1);
                    }}
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-maroon-800 text-cream text-xs rounded-full shadow-2xs">
                  <span>&quot;{searchQuery}&quot;</span>
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-maroon-700 hover:text-maroon-900 underline ml-2 cursor-pointer"
              >
                {t.home?.resetAllFilters || "Reset All"}
              </button>
            </div>
          )}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-5 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
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
                    {(() => {
                      const pageNumbers: (number | string)[] = [];
                      const delta = 1;
                      const range: number[] = [];

                      for (let i = 1; i <= totalPages; i++) {
                        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                          range.push(i);
                        }
                      }

                      let last: number | null = null;
                      for (const p of range) {
                        if (last !== null) {
                          if (p - last === 2) {
                            pageNumbers.push(last + 1);
                          } else if (p - last > 2) {
                            pageNumbers.push(`ellipsis-${last}`);
                          }
                        }
                        pageNumbers.push(p);
                        last = p;
                      }

                      return pageNumbers.map((item) => {
                        if (typeof item === "string") {
                          return (
                            <span
                              key={item}
                              className="w-7 h-7 flex items-center justify-center text-xs font-bold text-maroon-400 font-mono select-none"
                            >
                              ...
                            </span>
                          );
                        }

                        const isActive = item === currentPage;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setPage(item)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${
                              isActive
                                ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
                                : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      });
                    })()}
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
