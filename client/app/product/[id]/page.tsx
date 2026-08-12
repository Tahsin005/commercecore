"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Loader2,
  Package,
  Plus,
  Minus,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useProductDetailsQuery } from "@/hooks/useProductQueries";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [quantity, setQuantity] = useState<number>(1);

  // react Query hook for product details
  const { data: response, isLoading, error } = useProductDetailsQuery(id);
  const product = response?.data;

  const { addItem: addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="flex items-center space-x-3 text-maroon-700 bg-white p-6 px-8 rounded-xl shadow-md border border-maroon-100">
          <Loader2 className="w-6 h-6 animate-spin text-maroon-700" />
          <span className="text-sm font-semibold text-maroon-900">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-maroon-100 text-center space-y-4">
          <Package className="w-12 h-12 text-maroon-300 mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-maroon-900">Product Not Found</h1>
          <p className="text-xs text-maroon-700">{error?.message || "Requested product does not exist."}</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-maroon-900 text-white font-medium text-xs rounded-md shadow hover:bg-maroon-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
      },
      quantity
    );
    toast.success(`Added ${quantity} x "${product.name}" to cart`);
  };

  const handleToggleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.success(`Removed "${product.name}" from wishlist`);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
      });
      toast.success(`Added "${product.name}" to wishlist`);
    }
  };

  const handleOrderNow = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
      },
      quantity
    );
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <header className="bg-maroon-900 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-cream hover:text-white transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <span className="font-serif text-lg font-bold tracking-tight text-white">
            Product Showcase
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="bg-white rounded-2xl shadow-xl border border-maroon-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="bg-off-white p-8 sm:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-maroon-100 relative min-h-[320px]">
            <Package className="w-32 h-32 text-maroon-300" />
            {product.categoryId && (
              <span className="absolute top-6 left-6 bg-white border border-maroon-200 text-maroon-800 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-sm shadow-sm">
                {product.categoryId.name}
              </span>
            )}
          </div>

          <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-900 tracking-tight">
                  {product.name}
                </h1>
                <p className="text-sm text-maroon-700/90 mt-2 leading-relaxed font-sans">
                  {product.description || "High quality product with premium crafting."}
                </p>
              </div>

              <div className="pt-4 border-t border-maroon-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-maroon-500 block">
                    Price
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-maroon-900">
                    ৳{product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-sm text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-2">
                  Select Quantity
                </label>
                <div className="inline-flex items-center border border-maroon-200 rounded-md bg-off-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-maroon-100 text-maroon-800 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold font-mono text-sm text-maroon-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2.5 hover:bg-maroon-100 text-maroon-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-maroon-100">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-3 px-4 bg-maroon-800 hover:bg-maroon-700 active:scale-[0.98] text-white font-semibold text-xs rounded-md transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-cream" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`py-3 px-4 border font-semibold text-xs rounded-md transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer ${
                    wishlisted
                      ? "bg-maroon-900 text-cream border-maroon-800"
                      : "bg-white text-maroon-800 border-maroon-200 hover:bg-maroon-50"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? "fill-cream" : ""}`} />
                  <span>{wishlisted ? "Wishlisted" : "Wishlist"}</span>
                </button>
              </div>

              <button
                onClick={handleOrderNow}
                className="w-full py-3.5 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-semibold text-sm rounded-md transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-cream" />
                <span>Order Now</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
