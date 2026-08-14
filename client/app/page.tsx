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

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // React Query Hooks
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const { data: response, isLoading, error } = useProductsQuery(
    selectedCategory !== "all" ? selectedCategory : undefined
  );
  const products = response?.data || [];

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleToggleWishlist = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error(`No variants available for "${product.name}"`);
      return;
    }

    const defaultVariant = product.variants[0];
    const wishlisted = isInWishlist(defaultVariant.id);

    const price = defaultVariant.price !== null && defaultVariant.price !== undefined
      ? defaultVariant.price
      : product.defaultPrice;

    if (wishlisted) {
      removeFromWishlist(defaultVariant.id);
      toast.success(`Removed "${product.name}" from wishlist`);
    } else {
      addToWishlist({
        productVariantId: defaultVariant.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        size: defaultVariant.size,
        price,
      });
      toast.success(`Added "${product.name}" (${defaultVariant.size}) to wishlist`);
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

        {/* Category Filter Tabs */}
        {isCategoriesLoading ? (
          <CategoriesSkeleton />
        ) : categories.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-maroon-800 uppercase tracking-wider mb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>Browse Categories</span>
            </div>
            <div className="flex flex-wrap gap-2 pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-maroon-900 text-cream border-maroon-900 shadow-sm"
                    : "bg-white text-maroon-800 border-maroon-200 hover:bg-maroon-50"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-maroon-900 text-cream border-maroon-900 shadow-sm"
                      : "bg-white text-maroon-800 border-maroon-200 hover:bg-maroon-50"
                  }`}
                >
                  {cat.name}
                  {cat.isFeatured && (
                    <span className="ml-1 text-[9px] bg-cream text-maroon-900 px-1.5 py-0.2 rounded-full font-bold">
                      Featured
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-b border-maroon-100 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-maroon-900">Products Catalog</h2>
            <p className="text-xs text-maroon-700">Browse curated items available for order</p>
          </div>
          <span className="text-xs font-semibold text-maroon-600 bg-maroon-100 px-3 py-1 rounded-sm">
            {isLoading ? "..." : `${products.length} Items Available`}
          </span>
        </div>

        {isLoading && <ProductGridSkeleton count={8} />}

        {error && (
          <div className="p-6 bg-maroon-100/60 border border-maroon-200 rounded-xl text-maroon-900 text-center space-y-2">
            <p className="font-semibold text-base font-serif">Unable to load products</p>
            <p className="text-sm text-maroon-700">{error.message || "Failed to load product catalog"}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
              const wishlisted = defaultVariant ? isInWishlist(defaultVariant.id) : false;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md border border-maroon-100 overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="bg-off-white p-6 relative flex items-center justify-center border-b border-maroon-100/60 h-48">
                    <Package className="w-16 h-16 text-maroon-300 group-hover:scale-110 transition-transform duration-300" />
                    
                    <button
                      onClick={() => handleToggleWishlist(product)}
                      className={`absolute top-3 right-3 p-2 rounded-full border transition-all cursor-pointer shadow-sm ${
                        wishlisted
                          ? "bg-maroon-900 text-cream border-maroon-800"
                          : "bg-white text-maroon-600 border-maroon-200 hover:bg-maroon-50"
                      }`}
                      title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
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
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-maroon-900 line-clamp-1 group-hover:text-maroon-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-maroon-700/80 line-clamp-2 mt-1 font-sans">
                        {product.description || "No description provided."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-maroon-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-maroon-500 uppercase tracking-wider block">
                          Price
                        </span>
                        <span className="text-lg font-bold font-mono text-maroon-900">
                          ৳{product.defaultPrice.toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/product/${product.id}`}
                        className="px-3.5 py-2 bg-maroon-900 hover:bg-maroon-800 active:scale-95 text-white font-medium text-xs rounded-md transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
                        title="View Product Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-cream" />
                        <span>View Details</span>
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
