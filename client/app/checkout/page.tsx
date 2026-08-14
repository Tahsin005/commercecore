"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  User,
  Package,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOrderMutation } from "@/hooks/useOrderQueries";
import { checkoutSchema, CheckoutInput } from "@/lib/validations/order";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();

  const { items: cartItems, subtotal, updateQuantity, removeItem, isLoading: isCartLoading } = useCart();
  const wishlistItems = useWishlistStore((state) => state.items);

  const createOrderMutation = useCreateOrderMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.name || "",
      phone: user?.phone || "",
      shippingAddress: "",
      deliveryZone: "inside_dhaka",
    },
  });

  const deliveryZone = watch("deliveryZone") || "inside_dhaka";

  // autofill user details when authenticated user object hydrates
  useEffect(() => {
    if (user) {
      if (user.name) setValue("customerName", user.name);
      if (user.phone) setValue("phone", user.phone);
    }
  }, [user, setValue]);

  // delivery charge rates: 60 Taka for Inside Dhaka, 120 Taka for Outside Dhaka
  const deliveryCharge = deliveryZone === "outside_dhaka" ? 120 : 60;
  const totalAmount = subtotal + deliveryCharge;

  const onSubmit = (data: CheckoutInput) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderPayload = {
      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
      shippingAddress: data.shippingAddress.trim(),
      deliveryZone: data.deliveryZone,
      items: cartItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      })),
      guestCartItems: !isAuthenticated
        ? cartItems.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          }))
        : [],
      guestWishlistItems: !isAuthenticated
        ? wishlistItems.map((item) => ({
            productVariantId: item.productVariantId,
          }))
        : [],
    };

    createOrderMutation.mutate(orderPayload, {
      onSuccess: (response) => {
        const { order, user: orderUser, token } = response.data;

        if (token && orderUser) {
          toast.success(`Account registered & logged in for ${orderUser.name}!`);
        } else {
          toast.success("Order placed successfully!");
        }

        router.push(`/order-success/${order.orderNumber}`);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to place order");
      },
    });
  };

  if (!isHydrated || isCartLoading) {
    return (
      <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-20 flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center space-y-4 bg-white p-8 px-10 rounded-2xl shadow-xl border border-maroon-100">
            <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
            <span className="text-xs font-semibold uppercase tracking-wider text-maroon-900">
              Loading cart &amp; checkout details...
            </span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-maroon-100 max-w-md mx-auto space-y-4">
            <Package className="w-16 h-16 text-maroon-300 mx-auto" />
            <h1 className="text-2xl font-serif font-bold text-maroon-900">Your Cart is Empty</h1>
            <p className="text-xs text-maroon-700">Add products to your cart before proceeding to checkout.</p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-maroon-900 text-white font-medium text-xs rounded-md shadow hover:bg-maroon-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8" noValidate>
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-maroon-100 p-6 sm:p-8 space-y-6">
                <div className="border-b border-maroon-100 pb-4">
                  <h2 className="text-xl font-serif font-bold text-maroon-900">Customer &amp; Shipping Details</h2>
                  <p className="text-xs text-maroon-700 mt-0.5">
                    {isAuthenticated
                      ? "Confirm your shipping information"
                      : "Enter your contact details (an account will be automatically set up)"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="customerName" className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="customerName"
                        type="text"
                        placeholder="John Doe"
                        {...register("customerName")}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                      />
                    </div>
                    {errors.customerName && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="01700000000"
                        {...register("phone")}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-2">
                      Delivery Area *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          deliveryZone === "inside_dhaka"
                            ? "bg-maroon-900 text-white border-maroon-900 shadow-md"
                            : "bg-off-white text-maroon-900 border-maroon-200 hover:bg-maroon-50"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value="inside_dhaka"
                            {...register("deliveryZone")}
                            className="sr-only"
                          />
                          <span className="text-xs font-bold">Inside Dhaka</span>
                        </div>
                        <span className={`text-xs font-mono font-bold ${deliveryZone === "inside_dhaka" ? "text-cream" : "text-maroon-700"}`}>
                          ৳60
                        </span>
                      </label>

                      <label
                        className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          deliveryZone === "outside_dhaka"
                            ? "bg-maroon-900 text-white border-maroon-900 shadow-md"
                            : "bg-off-white text-maroon-900 border-maroon-200 hover:bg-maroon-50"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value="outside_dhaka"
                            {...register("deliveryZone")}
                            className="sr-only"
                          />
                          <span className="text-xs font-bold">Outside Dhaka</span>
                        </div>
                        <span className={`text-xs font-mono font-bold ${deliveryZone === "outside_dhaka" ? "text-cream" : "text-maroon-700"}`}>
                          ৳120
                        </span>
                      </label>
                    </div>
                    {errors.deliveryZone && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.deliveryZone.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="shippingAddress" className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                      Shipping Address *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3.5 text-maroon-500 pointer-events-none">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <textarea
                        id="shippingAddress"
                        rows={3}
                        placeholder="House no, Road no, Area details..."
                        {...register("shippingAddress")}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all resize-none"
                      />
                    </div>
                    {errors.shippingAddress && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.shippingAddress.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-maroon-100 p-6 sm:p-8 space-y-6">
                <div className="border-b border-maroon-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-maroon-900">Order Summary</h2>
                    <p className="text-xs text-maroon-700 mt-0.5">{cartItems.length} Unique Item(s)</p>
                  </div>
                  <ShoppingBag className="w-5 h-5 text-maroon-700" />
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.productVariantId}
                      className="flex items-center justify-between p-3.5 bg-off-white rounded-xl border border-maroon-100"
                    >
                      <div className="flex-1 space-y-0.5 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-semibold text-xs text-maroon-900 line-clamp-1">{item.name}</h4>
                          <span className="text-[10px] font-bold font-mono text-maroon-700 bg-white border border-maroon-200 px-1.5 py-0.2 rounded-sm shrink-0">
                            {item.size}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-maroon-700 block">
                          ৳{item.price.toFixed(2)} × {item.quantity}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="inline-flex items-center border border-maroon-200 rounded-md bg-white overflow-hidden shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}
                            className="p-1 text-maroon-800 hover:bg-maroon-100 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-bold font-mono text-xs text-maroon-900">
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

                <div className="pt-4 border-t border-maroon-100 space-y-2.5 text-xs font-sans">
                  <div className="flex items-center justify-between text-maroon-700">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold">৳{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-maroon-700">
                    <span>Delivery Charge ({deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                    <span className="font-mono font-semibold">৳{deliveryCharge.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t border-maroon-100 flex items-center justify-between text-sm font-bold text-maroon-900">
                    <span>Total Amount</span>
                    <span className="text-xl font-mono text-maroon-900">৳{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="w-full py-4 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.99] text-white font-semibold text-sm rounded-md transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cream" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-cream" />
                      <span>Place Order (Cash on Delivery)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
