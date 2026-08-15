"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  Package,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem, clearCart, cartCount } = useCart();
  const { t } = useLanguage();

  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [pendingVariantIds, setPendingVariantIds] = useState<Set<string>>(new Set());

  // Focus trapping, Escape key listener, and focus restoration
  useEffect(() => {
    if (!isOpen) return;

    // Save currently focused element to restore when drawer closes
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Move focus inside the drawer
    setTimeout(() => {
      drawerRef.current?.focus();
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  const handleBrowseProducts = () => {
    onClose();
    router.push("/");
  };

  const handleUpdateQuantity = async (productVariantId: string, newQuantity: number) => {
    if (pendingVariantIds.has(productVariantId)) return;

    setPendingVariantIds((prev) => new Set(prev).add(productVariantId));
    try {
      await updateQuantity(productVariantId, newQuantity);
    } finally {
      setPendingVariantIds((prev) => {
        const next = new Set(prev);
        next.delete(productVariantId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productVariantId: string) => {
    if (pendingVariantIds.has(productVariantId)) return;

    setPendingVariantIds((prev) => new Set(prev).add(productVariantId));
    try {
      await removeItem(productVariantId);
    } finally {
      setPendingVariantIds((prev) => {
        const next = new Set(prev);
        next.delete(productVariantId);
        return next;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.cartDrawer.title}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white text-text-main h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-300 font-sans focus:outline-none"
      >
        <div className="bg-maroon-900 text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5">
            <ShoppingCart className="w-5 h-5 text-cream" />
            <h2 className="font-serif font-bold text-lg text-white">{t.cartDrawer.title}</h2>
            <span className="bg-maroon-800 border border-maroon-700 text-cream font-mono font-bold text-xs px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-maroon-800 hover:bg-maroon-700 text-cream hover:text-white rounded-md transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-8">
              <div className="relative w-56 h-40 rounded-2xl overflow-hidden shadow-lg border border-maroon-100/80 group">
                <Image
                  src="/empty-cart.jpg"
                  alt="Your Cart is Waiting"
                  width={280}
                  height={200}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>

              <div className="space-y-2 max-w-xs">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-maroon-700 font-sans block">
                  {t.cartDrawer.emptyNotice}
                </span>
                <h3 className="font-serif font-bold text-xl text-maroon-900 tracking-tight">
                  {t.cartDrawer.emptyTitle}
                </h3>
                <div className="w-8 h-0.5 bg-maroon-700/60 mx-auto my-1.5" />
                <p className="text-xs text-maroon-700/80 leading-relaxed font-sans">
                  {t.cartDrawer.emptyDesc}
                </p>
              </div>

              <button
                onClick={handleBrowseProducts}
                className="px-6 py-3 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer group"
              >
                <ArrowRight className="w-4 h-4 text-cream group-hover:translate-x-1 transition-transform" />
                <span>{t.common.exploreProducts}</span>
              </button>

              <div className="pt-4 border-t border-maroon-100/80 w-full flex items-center justify-center space-x-4 text-[10px] text-maroon-600 font-medium">
                <span className="flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5 text-maroon-500" />
                  <span>{t.cartDrawer.nationwideShipping}</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-maroon-500" />
                  <span>{t.cartDrawer.cashOnDelivery}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const itemKey = item.productVariantId || item.productId;
                const isPending = pendingVariantIds.has(itemKey);

                return (
                  <div
                    key={itemKey}
                    className={`flex items-center justify-between p-3.5 bg-off-white rounded-xl border border-maroon-100 shadow-xs space-x-3 transition-opacity ${
                      isPending ? "opacity-60" : "opacity-100"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-maroon-200 flex items-center justify-center shrink-0 relative">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-maroon-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <Link
                          href={`/product/${item.productId}`}
                          onClick={onClose}
                          className="font-semibold text-xs text-maroon-900 hover:text-maroon-700 truncate"
                        >
                          {item.name}
                        </Link>
                        <span className="text-[10px] font-bold font-mono text-maroon-800 bg-white border border-maroon-200 px-1.5 py-0.2 rounded-sm shrink-0">
                          {item.size}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-maroon-700 block font-semibold">
                        ৳{item.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2.5 shrink-0">
                      <div className="inline-flex items-center border border-maroon-200 rounded-md bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleUpdateQuantity(itemKey, item.quantity - 1)}
                          className="p-1 text-maroon-800 hover:bg-maroon-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold font-mono text-xs text-maroon-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleUpdateQuantity(itemKey, item.quantity + 1)}
                          className="p-1 text-maroon-800 hover:bg-maroon-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRemoveItem(itemKey)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={t.cartDrawer.removeItem}
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

        {items.length > 0 && (
          <div className="p-5 bg-off-white border-t border-maroon-100 space-y-4">
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex items-center justify-between text-maroon-700">
                <span>{t.cartDrawer.subtotal}</span>
                <span className="font-mono font-bold text-sm text-maroon-900">
                  ৳{subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-maroon-500">
                {t.cartDrawer.shippingNotice}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.99] text-white font-semibold text-xs rounded-md transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <span>{t.cartDrawer.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4 text-cream" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-2 text-maroon-600 hover:text-red-700 text-[11px] font-medium transition-colors cursor-pointer text-center"
              >
                {t.cartDrawer.clearCart}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
