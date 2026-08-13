"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Heart,
  LogIn,
  LogOut,
  Loader2,
  Package,
  ArrowRight,
  Eye,
  Tag,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useProductsQuery, Product } from "@/hooks/useProductQueries";
import { useCategoriesQuery } from "@/hooks/useCategoryQueries";

export default function Home() {
  const { user, isAuthenticated, logout, isHydrated } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // React Query Hooks
  const { data: categoriesResponse } = useCategoriesQuery();
  const categories = categoriesResponse?.data || [];

  const { data: response, isLoading, error } = useProductsQuery(
    selectedCategory !== "all" ? selectedCategory : undefined
  );
  const products = response?.data || [];

  const { cartCount } = useCart();
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
      <header className="bg-maroon-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <Image
                src="/logo.png"
                alt="CommerceCore Logo"
                width={36}
                height={36}
                className="w-8 h-8 object-contain"
                priority
              />
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-cream transition-colors">
              CommerceCore
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/checkout"
              className="relative p-2.5 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 rounded-md text-cream hover:text-white transition-all flex items-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs font-semibold hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-cream text-maroon-900 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border border-maroon-900 shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {isHydrated && (
              <div className="flex items-center space-x-2">
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-cream hidden md:inline">
                      Hi, {user.name}
                    </span>
                    <button
                      onClick={logout}
                      className="p-2.5 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white rounded-md text-xs transition-all flex items-center space-x-1 cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-3.5 py-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white font-medium text-xs rounded-md transition-all flex items-center space-x-1"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        <div className="bg-maroon-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block bg-maroon-800 border border-maroon-700 px-3 py-1 rounded-sm text-xs font-semibold text-cream uppercase tracking-wider">
              Featured Collection
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Premium E-Commerce Store
            </h1>
            <p className="text-sm text-maroon-200 max-w-lg font-sans">
              Discover top products across fashion, electronics, accessories, and shoes with instant checkout support.
            </p>
          </div>
          <Link
            href="/checkout"
            className="px-6 py-3 bg-white text-maroon-900 hover:bg-cream font-semibold text-sm rounded-md transition-all shadow-md flex items-center space-x-2 shrink-0"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
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
        )}

        <div className="flex items-center justify-between border-b border-maroon-100 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-maroon-900">Products Catalog</h2>
            <p className="text-xs text-maroon-700">Browse curated items available for order</p>
          </div>
          <span className="text-xs font-semibold text-maroon-600 bg-maroon-100 px-3 py-1 rounded-sm">
            {products.length} Items Available
          </span>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
            <span className="text-sm font-medium text-maroon-800">Loading product catalog...</span>
          </div>
        )}

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

      <footer className="bg-maroon-900 text-white p-6 border-t border-maroon-800 text-center font-sans mt-12">
        <p className="text-xs text-maroon-200 font-medium tracking-wide">
          CommerceCore v1.0 &bull; E-Commerce Platform
        </p>
      </footer>
    </div>
  );
}
