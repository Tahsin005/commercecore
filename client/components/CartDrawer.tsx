"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem, clearCart, cartCount } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white text-text-main h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-300 font-sans">
        <div className="bg-maroon-900 text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2.5">
            <ShoppingCart className="w-5 h-5 text-cream" />
            <h2 className="font-serif font-bold text-lg text-white">Your Shopping Cart</h2>
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
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-off-white border border-maroon-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-maroon-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-maroon-900">Your Cart is Empty</h3>
                <p className="text-xs text-maroon-700 max-w-xs">
                  Looks like you haven't added any products to your cart yet.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-md shadow transition-all cursor-pointer"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productVariantId}
                  className="flex items-center justify-between p-3.5 bg-off-white rounded-xl border border-maroon-100 shadow-xs space-x-3"
                >
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
                        onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}
                        className="p-1 text-maroon-800 hover:bg-maroon-100 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold font-mono text-xs text-maroon-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}
                        className="p-1 text-maroon-800 hover:bg-maroon-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productVariantId)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 bg-off-white border-t border-maroon-100 space-y-4">
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex items-center justify-between text-maroon-700">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-sm text-maroon-900">
                  ৳{subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-maroon-500">
                Shipping &amp; taxes calculated at checkout.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.99] text-white font-semibold text-xs rounded-md transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-cream" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-2 text-maroon-600 hover:text-red-700 text-[11px] font-medium transition-colors cursor-pointer text-center"
              >
                Clear All Cart Items
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
