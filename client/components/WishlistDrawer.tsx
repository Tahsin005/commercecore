"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  X,
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
} from "lucide-react";

import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const router = useRouter();
  const { items, removeFromWishlist, wishlistCount } = useWishlist();
  const { addItem } = useCart();
  const { t } = useLanguage();

  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Focus trapping, Escape key listener, and focus restoration
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      drawerRef.current?.focus();
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBrowseProducts = () => {
    onClose();
    router.push("/");
  };

  const handleRemoveItem = async (itemKey: string) => {
    if (pendingIds.has(itemKey)) return;

    setPendingIds((prev) => new Set(prev).add(itemKey));
    try {
      await removeFromWishlist(itemKey);
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    }
  };

  const handleAddToCart = async (item: any) => {
    const itemKey = item.productVariantId || item.productId;
    if (pendingIds.has(itemKey)) return;

    setPendingIds((prev) => new Set(prev).add(itemKey));
    try {
      await addItem({
        productId: item.productId,
        productVariantId: item.productVariantId,
        name: item.name,
        slug: item.slug,
        size: item.size || "Standard",
        price: item.price,
        imageUrl: item.imageUrl,
      }, 1);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    }
  };

  const handleMoveAllToCart = async () => {
    for (const item of items) {
      await addItem({
        productId: item.productId,
        productVariantId: item.productVariantId,
        name: item.name,
        slug: item.slug,
        size: item.size || "Standard",
        price: item.price,
        imageUrl: item.imageUrl,
      }, 1);
    }
    toast.success("All items moved to cart!");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.navbar.wishlist}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white text-text-main h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-300 font-sans focus:outline-none"
      >
        {/* Header */}
        <div className="bg-maroon-900 text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5">
            <Heart className="w-5 h-5 text-cream fill-cream" />
            <h2 className="font-serif font-bold text-lg text-white">{t.navbar.wishlist}</h2>
            <span className="bg-maroon-800 border border-maroon-700 text-cream font-mono font-bold text-xs px-2 py-0.5 rounded-full">
              {wishlistCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-maroon-800 hover:bg-maroon-700 text-cream hover:text-white rounded-md transition-colors cursor-pointer"
            aria-label="Close wishlist drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-maroon-50 rounded-full flex items-center justify-center text-maroon-400 border border-maroon-100">
                <Heart className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <h3 className="font-serif font-bold text-xl text-maroon-900">Your Wishlist is Empty</h3>
                <p className="text-xs text-maroon-700/80 leading-relaxed">
                  Save items you love while browsing to view them here later and quickly add them to your cart!
                </p>
              </div>

              <button
                onClick={handleBrowseProducts}
                className="px-6 py-3 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer group mt-2"
              >
                <ArrowRight className="w-4 h-4 text-cream group-hover:translate-x-1 transition-transform" />
                <span>{t.common.exploreProducts}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const itemKey = item.productVariantId || item.productId;
                const isPending = pendingIds.has(itemKey);

                return (
                  <div
                    key={itemKey}
                    className={`flex items-center justify-between p-3.5 bg-off-white rounded-xl border border-maroon-100 shadow-xs space-x-3 transition-opacity ${
                      isPending ? "opacity-60" : "opacity-100"
                    }`}
                  >
                    {/* Item Image */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-maroon-200 flex items-center justify-center shrink-0 relative">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-maroon-300" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-1 min-w-0">
                      <Link
                        href={`/product/${item.productId}`}
                        onClick={onClose}
                        className="font-bold text-xs text-maroon-900 hover:text-maroon-700 truncate block"
                      >
                        {item.name}
                      </Link>

                      <div className="flex items-center space-x-2">
                        {item.size && (
                          <span className="text-[10px] font-bold font-mono text-maroon-800 bg-white border border-maroon-200 px-1.5 py-0.2 rounded-sm shrink-0">
                            {item.size}
                          </span>
                        )}
                        <span className="text-xs font-mono text-maroon-700 font-bold">
                          ৳{item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAddToCart(item)}
                        className="p-2 bg-maroon-900 hover:bg-maroon-800 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4 text-cream" />
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRemoveItem(itemKey)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-5 bg-off-white border-t border-maroon-100 space-y-3">
            <button
              onClick={handleMoveAllToCart}
              className="w-full py-3.5 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.99] text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-cream" />
              <span>Add All Items to Cart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
