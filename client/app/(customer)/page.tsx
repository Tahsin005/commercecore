"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  ListFilter,
  Truck,
  ShieldCheck,
  Headphones,
  Sparkles,
} from "lucide-react";

import { useProductsQuery, useGlobalVariantsQuery } from "@/hooks/useProductQueries";
import { useCategoriesQuery } from "@/hooks/useCategoryQueries";
import { HomepageBanners } from "@/components/HomepageBanners";
import { ProductGridSkeleton } from "@/components/skeletons";
import { ProductCard } from "@/components/ProductCard";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const limit = 12;

  const { t } = useLanguage();

  // React Query Hooks
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [categories]);

  const { data: variantsResponse, isLoading: isVariantsLoading } = useGlobalVariantsQuery(false);
  const variants = variantsResponse?.data || [];

  const sortedVariants = useMemo(() => {
    return [...variants].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [variants]);

  const { data: response, isLoading, error } = useProductsQuery({
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
    variantId: selectedVariantId === "all" ? undefined : selectedVariantId,
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

  const handleVariantSelect = (vId: string) => {
    setSelectedVariantId(vId);
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

  const handleApplyFilters = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setPage(1);
    if (mobileFilterOpen) setMobileFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedVariantId("all");
    setSearchQuery("");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setPage(1);
    if (mobileFilterOpen) setMobileFilterOpen(false);
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedVariantId !== "all" ||
    searchQuery.trim() !== "" ||
    sortBy !== "newest" ||
    appliedMinPrice !== "" ||
    appliedMaxPrice !== "";

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedVariantId !== "all") count++;
    if (searchQuery.trim() !== "") count++;
    if (sortBy !== "newest") count++;
    if (appliedMinPrice !== "") count++;
    if (appliedMaxPrice !== "") count++;
    return count;
  }, [selectedCategory, selectedVariantId, searchQuery, sortBy, appliedMinPrice, appliedMaxPrice]);

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const activeVariantObj = sortedVariants.find((v) => v.id === selectedVariantId);

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-6 flex-1">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-5 lg:sticky lg:top-28">

            <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">
              <div className="bg-maroon-900 text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-5 h-5 text-cream" />
                  <h2 className="font-serif font-bold text-sm sm:text-base tracking-wide text-white">
                    {t.home?.ageRangeFilter || "বয়সের ফিল্টার"}
                  </h2>
                </div>
                {selectedVariantId !== "all" && (
                  <button
                    type="button"
                    onClick={() => handleVariantSelect("all")}
                    className="text-[11px] text-cream/90 hover:text-white underline font-semibold transition-colors cursor-pointer"
                  >
                    {t.home?.clearFilters || "মুছুন"}
                  </button>
                )}
              </div>

              <div className="divide-y divide-maroon-50 max-h-[380px] overflow-y-auto scrollbar-thin p-1">
                <button
                  type="button"
                  onClick={() => handleVariantSelect("all")}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-semibold rounded-xl transition-all cursor-pointer ${selectedVariantId === "all"
                      ? "bg-maroon-900 text-white font-bold shadow-xs"
                      : "text-maroon-800 hover:bg-maroon-50"
                    }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className={`w-3.5 h-3.5 ${selectedVariantId === "all" ? "text-cream" : "text-maroon-600"}`} />
                    <span>{t.home?.allAges || "সকল বয়স"}</span>
                  </div>
                  {selectedVariantId === "all" ? (
                    <span className="w-2 h-2 rounded-full bg-cream inline-block" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-maroon-300" />
                  )}
                </button>

                {sortedVariants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  const label = variant.label || variant.size || "Standard";
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleVariantSelect(variant.id)}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs font-semibold rounded-xl transition-all cursor-pointer ${isSelected
                          ? "bg-maroon-900 text-white font-bold shadow-xs"
                          : "text-maroon-800 hover:bg-maroon-50"
                        }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-cream" : "bg-maroon-400"}`} />
                        <span className="truncate">{label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-cream" : "text-maroon-300"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm p-4 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-maroon-100">
                <span className="font-serif font-bold text-sm text-maroon-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-maroon-700" />
                  <span>{t.home?.priceFilter || "দামের ফিল্টার"}</span>
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[11px] font-bold text-maroon-700 hover:text-maroon-900 flex items-center space-x-1 cursor-pointer bg-maroon-50 hover:bg-maroon-100 px-2 py-1 rounded-lg transition-colors"
                    title={t.home?.clearFilters || "Clear Filters"}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.home?.clearFilters || "মুছুন"}</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-maroon-700 uppercase tracking-wider block">
                  {t.common?.price || "মূল্য পরিসীমা"}
                </label>
                <PriceRangeSlider
                  minBound={minBound}
                  maxBound={maxBound}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${minPrice !== appliedMinPrice || maxPrice !== appliedMaxPrice
                      ? "bg-maroon-900 hover:bg-maroon-800 text-cream shadow-md"
                      : "bg-maroon-100 hover:bg-maroon-200 text-maroon-900 border border-maroon-200"
                    }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>{t.home?.applyFilters || "Apply Filters"}</span>
                  {(minPrice !== appliedMinPrice || maxPrice !== appliedMaxPrice) && (
                    <span className="w-2 h-2 rounded-full bg-cream inline-block animate-ping" />
                  )}
                </button>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-maroon-100">
                <label className="text-[11px] font-bold text-maroon-700 uppercase tracking-wider block">
                  {t.home?.sortBy || "সর্টিং"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-maroon-500">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all cursor-pointer appearance-none"
                  >
                    <option value="newest">{t.home?.sortNewest || "Newest First"}</option>
                    <option value="price_asc">{t.home?.sortPriceLowToHigh || "Price: Low to High"}</option>
                    <option value="price_desc">{t.home?.sortPriceHighToLow || "Price: High to Low"}</option>
                    <option value="oldest">{t.home?.sortOldest || "Oldest First"}</option>
                    <option value="name_asc">{t.home?.sortNameAsc || "Name: A to Z"}</option>
                    <option value="name_desc">{t.home?.sortNameDesc || "Name: Z to A"}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-maroon-400">
                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

          </aside>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">

            <HomepageBanners />

            <div className="bg-white rounded-2xl border border-maroon-100 p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-maroon-800" />
                  <h3 className="font-serif font-bold text-sm sm:text-base text-maroon-900">
                    {t.home?.categoriesTitle || "ক্যাটাগরি সমূহ"}
                  </h3>
                </div>
                <Link
                  href="/categories"
                  className="text-xs font-semibold text-maroon-800 hover:text-maroon-900 hover:underline flex items-center space-x-1"
                >
                  <span>{t.home?.showAllCategories || "সকল দেখুন"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin pt-0.5">
                <button
                  type="button"
                  onClick={() => handleCategorySelect("all")}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${selectedCategory === "all"
                      ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
                      : "bg-off-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200/80"
                    }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{t.home?.allProducts || "সকল পণ্য"}</span>
                </button>

                {sortedCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${isSelected
                          ? "bg-maroon-900 text-white border-maroon-900 shadow-md ring-2 ring-maroon-900/30"
                          : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
                        }`}
                    >
                      {cat.imageUrl ? (
                        <div className="w-6 h-6 rounded-lg overflow-hidden relative shrink-0 border border-black/10">
                          <Image src={cat.imageUrl} alt={cat.name} fill sizes="24px" className="object-cover" />
                        </div>
                      ) : (
                        <Tag className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      )}
                      <span className="whitespace-nowrap">{cat.name}</span>
                      {cat.isFeatured && !isSelected && (
                        <span className="bg-maroon-900 text-cream text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-2xs">
                          HOT
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-maroon-100/80 p-3.5 flex items-center space-x-3 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-900 flex items-center justify-center shrink-0 border border-maroon-100">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-maroon-900 truncate">
                    {t.home?.featureCodTitle || "Cash on Delivery"}
                  </h4>
                  <p className="text-[10px] text-maroon-600 truncate">
                    {t.home?.featureCodDesc || "Pay after inspecting product"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-maroon-100/80 p-3.5 flex items-center space-x-3 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-900 flex items-center justify-center shrink-0 border border-maroon-100">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-maroon-900 truncate">
                    {t.home?.featureReturnTitle || "Easy Return Policy"}
                  </h4>
                  <p className="text-[10px] text-maroon-600 truncate">
                    {t.home?.featureReturnDesc || "Hassle-free 7-day returns"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-maroon-100/80 p-3.5 flex items-center space-x-3 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-900 flex items-center justify-center shrink-0 border border-maroon-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-maroon-900 truncate">
                    {t.home?.featureDeliveryTitle || "Nationwide Delivery"}
                  </h4>
                  <p className="text-[10px] text-maroon-600 truncate">
                    {t.home?.featureDeliveryDesc || "Fast & reliable shipping"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-maroon-100/80 p-3.5 flex items-center space-x-3 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-900 flex items-center justify-center shrink-0 border border-maroon-100">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-maroon-900 truncate">
                    {t.home?.featureSupportTitle || "24/7 Customer Support"}
                  </h4>
                  <p className="text-[10px] text-maroon-600 truncate">
                    {t.home?.featureSupportDesc || "We're always here for you"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-maroon-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900">
                      {activeCategoryObj ? activeCategoryObj.name : (t.home?.productsCatalog || "Products Catalog")}
                    </h2>
                    {activeCategoryObj?.isFeatured && (
                      <span className="bg-maroon-900 text-cream text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-2xs">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-maroon-700 mt-0.5">
                    {activeCategoryObj ? `${activeCategoryObj.name}` : (t.home?.catalogDesc || "Browse curated items available for order")}
                  </p>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden inline-flex items-center space-x-1.5 px-3 py-1.5 bg-maroon-900 hover:bg-maroon-800 text-cream font-bold text-xs rounded-xl shadow-xs cursor-pointer border border-maroon-700 transition-all active:scale-95"
                  >
                    <ListFilter className="w-3.5 h-3.5 text-cream" />
                    <span>{t.home?.filterBtn || "Filter"}</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-cream text-maroon-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  <span className="text-xs font-bold text-maroon-900 bg-maroon-100 border border-maroon-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
                    {isLoading ? "..." : `${totalProducts} ${t.home?.itemsAvailable || "Items Available"}`}
                  </span>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-maroon-600 uppercase tracking-wider">
                    {t.home?.filtersLabel || "Filters:"}
                  </span>
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-maroon-900 text-cream text-xs rounded-full shadow-2xs">
                      <span>{activeCategoryObj?.name || "Category"}</span>
                      <button
                        type="button"
                        onClick={() => handleCategorySelect("all")}
                        className="hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                  {selectedVariantId !== "all" && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-maroon-900 text-cream text-xs rounded-full shadow-2xs">
                      <span>{activeVariantObj?.label || "Age"}</span>
                      <button
                        type="button"
                        onClick={() => handleVariantSelect("all")}
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

              {isLoading && <ProductGridSkeleton count={8} />}

              {error && (
                <div className="p-6 bg-maroon-100/60 border border-maroon-200 rounded-xl text-maroon-900 text-center space-y-2">
                  <p className="font-semibold text-base font-serif">{t.home?.unableToLoad || "পণ্য লোড করা সম্ভব হয়নি"}</p>
                </div>
              )}

              {!isLoading && !error && products.length === 0 && (
                <div className="p-12 bg-white border border-maroon-100 rounded-2xl text-center space-y-3 shadow-xs">
                  <Package className="w-12 h-12 text-maroon-300 mx-auto" />
                  <p className="font-serif font-bold text-lg text-maroon-900">
                    {t.home?.noProductsFound || "আপনার অনুসন্ধান বা ফিল্টারের সাথে কোনো পণ্য পাওয়া যায়নি।"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-maroon-900 text-cream text-xs font-semibold rounded-xl hover:bg-maroon-800 transition-colors cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.home?.clearFilters || "ফিল্টার মুছুন"}</span>
                    </button>
                  )}
                </div>
              )}

              {!isLoading && !error && products.length > 0 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-maroon-100">
                      <span className="text-xs font-semibold text-maroon-700">
                        {t.home?.page || "Page"} <strong className="text-maroon-900 font-mono">{currentPage}</strong> {t.home?.of || "of"}{" "}
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
                          <span>{t.home?.previous || "Previous"}</span>
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
                                  <span key={item} className="px-1 text-xs text-maroon-400 font-mono select-none">
                                    ...
                                  </span>
                                );
                              }

                              const pageNum = item;
                              const isActive = pageNum === currentPage;
                              return (
                                <button
                                  key={pageNum}
                                  type="button"
                                  onClick={() => setPage(pageNum)}
                                  className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${isActive
                                      ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
                                      : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
                                    }`}
                                >
                                  {pageNum}
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
                          <span>{t.home?.next || "Next"}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="fixed bottom-6 right-5 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="group relative flex items-center space-x-2 bg-maroon-900 hover:bg-maroon-800 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl border-2 border-cream/50 cursor-pointer active:scale-95 transition-all"
            aria-label={t.home?.filterBtn || "Filter"}
          >
            <ListFilter className="w-4 h-4 text-cream" />
            <span>{t.home?.filterBtn || "Filter"}</span>
            {activeFiltersCount > 0 ? (
              <span className="bg-cream text-maroon-900 font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-maroon-900 shadow">
                {activeFiltersCount}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>

        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-250 animate-in fade-in"
              onClick={() => setMobileFilterOpen(false)}
            />

            <div className="relative w-full sm:max-w-lg max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-maroon-100 z-10 animate-in slide-in-from-bottom duration-250">
              <div className="bg-maroon-900 text-white px-5 py-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <ListFilter className="w-5 h-5 text-cream" />
                  <h3 className="font-serif font-bold text-base tracking-wide text-white">
                    {t.home?.filterBtn || "ফিল্টার"}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-xs font-bold text-cream/90 hover:text-white underline px-2 py-1 cursor-pointer"
                    >
                      {t.home?.clearFilters || "Clear"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-full hover:bg-maroon-800 text-cream hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-6 overflow-y-auto flex-1 divide-y divide-maroon-100">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-maroon-900 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-maroon-700" />
                      <span>{t.home?.ageRangeFilter || "Age Ranges"}</span>
                    </span>
                    {selectedVariantId !== "all" && (
                      <button
                        type="button"
                        onClick={() => handleVariantSelect("all")}
                        className="text-xs text-maroon-700 hover:text-maroon-900 underline font-semibold cursor-pointer"
                      >
                        {t.home?.clearFilters || "Reset"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                    <button
                      type="button"
                      onClick={() => handleVariantSelect("all")}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all text-left cursor-pointer ${selectedVariantId === "all"
                          ? "bg-maroon-900 text-white border-maroon-900 shadow-xs"
                          : "bg-off-white text-maroon-800 border-maroon-200 hover:bg-maroon-50"
                        }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t.home?.allAges || "All Ages"}</span>
                    </button>

                    {sortedVariants.map((variant) => {
                      const isSelected = selectedVariantId === variant.id;
                      const label = variant.label || variant.size || "Standard";
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => handleVariantSelect(variant.id)}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all text-left cursor-pointer ${isSelected
                              ? "bg-maroon-900 text-white border-maroon-900 shadow-xs"
                              : "bg-off-white text-maroon-800 border-maroon-200 hover:bg-maroon-50"
                            }`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-cream" : "bg-maroon-400"}`} />
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5 pt-4">
                  <label className="text-xs font-bold text-maroon-900 uppercase tracking-wider block">
                    {t.common?.price || "Price Range"}
                  </label>
                  <PriceRangeSlider
                    minBound={minBound}
                    maxBound={maxBound}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onChange={(min, max) => {
                      setMinPrice(min);
                      setMaxPrice(max);
                    }}
                  />
                </div>

                <div className="space-y-2.5 pt-4">
                  <label className="text-xs font-bold text-maroon-900 uppercase tracking-wider block">
                    {t.home?.sortBy || "Sort By"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-maroon-500">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 cursor-pointer appearance-none"
                    >
                      <option value="newest">{t.home?.sortNewest || "Newest First"}</option>
                      <option value="price_asc">{t.home?.sortPriceLowToHigh || "Price: Low to High"}</option>
                      <option value="price_desc">{t.home?.sortPriceHighToLow || "Price: High to Low"}</option>
                      <option value="oldest">{t.home?.sortOldest || "Oldest First"}</option>
                      <option value="name_asc">{t.home?.sortNameAsc || "Name: A to Z"}</option>
                      <option value="name_desc">{t.home?.sortNameDesc || "Name: Z to A"}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-maroon-400">
                      <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-off-white border-t border-maroon-100 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="w-full py-3 bg-maroon-900 hover:bg-maroon-800 text-cream font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-2"
                >
                  <ListFilter className="w-4 h-4" />
                  <span>{t.home?.applyFilters || "Apply Filters"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
