"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  User,
  Truck,
  CreditCard,
  ShieldCheck,
  Package,
  FileText,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOrderMutation } from "@/hooks/useOrderQueries";
import { getCheckoutSchema, CheckoutInput } from "@/lib/validations/order";
import { CheckoutSkeleton, OrderSuccessSkeleton } from "@/components/skeletons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { trackInitiateCheckout, trackPurchase } from "@/lib/meta-pixel";

import { useSiteSettingsQuery } from "@/hooks/useSettingsQueries";
import { useUserAddressesQuery } from "@/hooks/useAddressQueries";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const { t } = useLanguage();
  const { data: siteSettings } = useSiteSettingsQuery();

  const { items: cartItems, subtotal, updateQuantity, removeItem, isLoading: isCartLoading } = useCart();
  const wishlistItems = useWishlistStore((state) => state.items);

  const createOrderMutation = useCreateOrderMutation();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(getCheckoutSchema(t)),
    defaultValues: {
      customerName: user?.name || "",
      phone: user?.phone || "",
      shippingAddress: "",
      deliveryZone: "inside_dhaka",
    },
  });

  const deliveryZone = watch("deliveryZone") || "inside_dhaka";

  const { data: addressesRes } = useUserAddressesQuery(Boolean(isHydrated && isAuthenticated));
  const addresses = addressesRes?.data || [];

  const hasInitializedAddressRef = useRef(false);
  const hasTrackedInitiateCheckoutRef = useRef(false);

  // Track InitiateCheckout on page load if cart has items
  useEffect(() => {
    if (isHydrated && !isCartLoading && cartItems.length > 0 && !hasTrackedInitiateCheckoutRef.current) {
      trackInitiateCheckout(cartItems, subtotal);
      hasTrackedInitiateCheckoutRef.current = true;
    }
  }, [isHydrated, isCartLoading, cartItems, subtotal]);

  // autofill user details & default address when authenticated
  useEffect(() => {
    if (user) {
      if (user.name && !getValues("customerName")) setValue("customerName", user.name);
      if (user.phone && !getValues("phone")) setValue("phone", user.phone);
    }
    if (addresses && addresses.length > 0 && !hasInitializedAddressRef.current) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr && defaultAddr.fullAddress) {
        setValue("shippingAddress", defaultAddr.fullAddress);
        const cityLower = (defaultAddr.city || "").toLowerCase();
        if (cityLower.includes("dhaka") || cityLower.includes("ঢাকা")) {
          setValue("deliveryZone", "inside_dhaka");
        } else {
          setValue("deliveryZone", "outside_dhaka");
        }
        hasInitializedAddressRef.current = true;
      }
    }
  }, [user, addresses, setValue, getValues]);

  // delivery charge rates from site settings
  const insideDhakaRate = siteSettings?.delivery_charge?.insideDhaka ?? 60;
  const outsideDhakaRate = siteSettings?.delivery_charge?.outsideDhaka ?? 120;
  const deliveryCharge = deliveryZone === "outside_dhaka" ? outsideDhakaRate : insideDhakaRate;
  const totalAmount = Math.max(0, subtotal + deliveryCharge);

  const onSubmit = (data: CheckoutInput) => {
    if (cartItems.length === 0) {
      toast.error(t.checkout.emptyTitle);
      return;
    }

    const orderPayload = {
      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
      shippingAddress: data.shippingAddress.trim(),
      notes: data.notes ? data.notes.trim() : undefined,
      deliveryZone: data.deliveryZone,
      items: cartItems.map((item) => ({
        productId: item.productId,
        productVariantId:
          typeof item.productVariantId === "string" && item.productVariantId !== item.productId
            ? item.productVariantId
            : undefined,
        selectedVariantLabel: item.size,
        quantity: item.quantity,
      })),
      guestCartItems: !isAuthenticated
        ? cartItems.map((item) => ({
            productId: item.productId,
            productVariantId:
              typeof item.productVariantId === "string" && item.productVariantId !== item.productId
                ? item.productVariantId
                : undefined,
            quantity: item.quantity,
          }))
        : [],
      guestWishlistItems: !isAuthenticated
        ? wishlistItems.map((item) => ({
            productId: item.productId,
            productVariantId:
              typeof item.productVariantId === "string" && item.productVariantId !== item.productId
                ? item.productVariantId
                : undefined,
          }))
        : [],
    };

    createOrderMutation.mutate(orderPayload, {
      onSuccess: (response) => {
        const { order, user: orderUser, token } = response.data;

        // Track Purchase event with eventID for CAPI deduplication
        trackPurchase({
          orderNumber: order.orderNumber,
          total: order.total,
          items: cartItems,
        });

        if (token && orderUser) {
          toast.success(t.checkout.accountRegisteredToast(orderUser.name));
        } else {
          toast.success(t.checkout.orderSuccessToast);
        }

        router.push(`/order-success/${order.orderNumber}`);
      },
      onError: (err) => {
        const errorMsg = err?.message;
        let message = t.common.error;
        if (errorMsg) {
          const lower = errorMsg.toLowerCase();
          if (lower.includes("failed to place order") || lower.includes("order failed")) {
            message = t.authErrors.orderFailed;
          } else {
            message = errorMsg;
          }
        }
        toast.error(message);
      },
    });
  };

  // Render receipt skeleton during successful order creation transition
  if (createOrderMutation.isSuccess) {
    return <OrderSuccessSkeleton />;
  }

  if (!isHydrated || isCartLoading) {
    return <CheckoutSkeleton />;
  }

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {cartItems.length === 0 && !createOrderMutation.isSuccess && !createOrderMutation.isPending ? (
          <div className="py-8 sm:py-12 flex flex-col justify-between min-h-[70vh]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-5xl mx-auto w-full my-auto">
              <div className="lg:col-span-5 flex justify-center order-1 lg:order-1">
                <div className="relative w-full max-w-sm aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-maroon-100/80 group">
                  <Image
                    src="/empty-cart.jpg"
                    alt="Your Cart is Waiting"
                    width={500}
                    height={375}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-900/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6 text-center lg:text-left order-2 lg:order-2 flex flex-col items-center lg:items-start">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-maroon-700 font-sans block">
                    {t.cartDrawer.emptyNotice}
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-maroon-900 tracking-tight leading-[1.15]">
                    {t.checkout.emptyTitle}
                  </h1>
                  <div className="w-12 h-0.5 bg-maroon-700/60 mx-auto lg:mx-0 my-2" />
                  <p className="text-xs sm:text-sm text-maroon-700/85 max-w-md font-sans leading-relaxed">
                    {t.checkout.emptyDesc}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-2.5 px-7 py-3.5 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer group"
                  >
                    <ArrowRight className="w-4 h-4 text-cream group-hover:translate-x-1 transition-transform" />
                    <span>{t.common.exploreProducts}</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-maroon-200/50 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-5xl mx-auto w-full">
              <div className="flex items-center space-x-3.5 p-3.5 bg-white rounded-xl border border-maroon-100 shadow-xs">
                <div className="p-2.5 bg-maroon-100/60 border border-maroon-200/60 rounded-full text-maroon-900 shrink-0">
                  <Truck className="w-5 h-5 text-maroon-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-maroon-900 font-sans">{t.footer.fastDeliveryTitle}</h4>
                  <p className="text-[11px] text-maroon-700/80 mt-0.5">{t.footer.fastDeliveryDesc}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 p-3.5 bg-white rounded-xl border border-maroon-100 shadow-xs">
                <div className="p-2.5 bg-maroon-100/60 border border-maroon-200/60 rounded-full text-maroon-900 shrink-0">
                  <CreditCard className="w-5 h-5 text-maroon-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-maroon-900 font-sans">{t.footer.codTitle}</h4>
                  <p className="text-[11px] text-maroon-700/80 mt-0.5">{t.footer.codDesc}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 p-3.5 bg-white rounded-xl border border-maroon-100 shadow-xs">
                <div className="p-2.5 bg-maroon-100/60 border border-maroon-200/60 rounded-full text-maroon-900 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-maroon-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-maroon-900 font-sans">{t.footer.qualityTitle}</h4>
                  <p className="text-[11px] text-maroon-700/80 mt-0.5">{t.footer.qualityDesc}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8" noValidate>
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-maroon-100 p-6 sm:p-8 space-y-6">
                <div className="border-b border-maroon-100 pb-4">
                  <h2 className="text-xl font-serif font-bold text-maroon-900">{t.checkout.customerDetailsTitle}</h2>
                  <p className="text-xs text-maroon-700 mt-0.5">
                    {isAuthenticated
                      ? t.checkout.customerDetailsAuth
                      : t.checkout.customerDetailsGuest}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="customerName" className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                      {t.checkout.fullName}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="customerName"
                        type="text"
                        placeholder={t.checkout.fullNamePlaceholder}
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
                      {t.checkout.mobileNumber}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        placeholder={t.checkout.mobilePlaceholder}
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
                      {t.checkout.deliveryArea}
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
                          <span className="text-xs font-bold">{t.checkout.insideDhaka}</span>
                        </div>
                        <span className={`text-xs font-mono font-bold ${deliveryZone === "inside_dhaka" ? "text-cream" : "text-maroon-700"}`}>
                          ৳{insideDhakaRate}
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
                          <span className="text-xs font-bold">{t.checkout.outsideDhaka}</span>
                        </div>
                        <span className={`text-xs font-mono font-bold ${deliveryZone === "outside_dhaka" ? "text-cream" : "text-maroon-700"}`}>
                          ৳{outsideDhakaRate}
                        </span>
                      </label>
                    </div>
                    {errors.deliveryZone && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.deliveryZone.message}</p>
                    )}
                  </div>

                  <div>
                    {addresses.length > 0 && (
                      <div className="space-y-1.5 pb-3">
                        <span className="text-[11px] font-bold text-maroon-800 uppercase tracking-wider block">
                          {t.profile.selectSavedAddress || "Select Saved Address:"}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {addresses.map((addr) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => {
                                setValue("shippingAddress", addr.fullAddress);
                                const cityLower = (addr.city || "").toLowerCase();
                                if (cityLower.includes("dhaka") || cityLower.includes("ঢাকা")) {
                                  setValue("deliveryZone", "inside_dhaka");
                                } else {
                                  setValue("deliveryZone", "outside_dhaka");
                                }
                                const labelText = addr.label || "Saved Address";
                                toast.success(
                                  typeof t.profile.addressSelectedToast === "function"
                                    ? t.profile.addressSelectedToast(labelText)
                                    : `Address selected: "${labelText}"`
                                );
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                                watch("shippingAddress") === addr.fullAddress
                                  ? "bg-maroon-900 text-white border-maroon-900 shadow-sm"
                                  : "bg-off-white hover:bg-maroon-50 text-maroon-900 border-maroon-200"
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{addr.label || "Home"}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] bg-amber-400 text-maroon-950 font-extrabold px-1 rounded ml-0.5">
                                  {t.profile.defaultBadge || "Default"}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <label htmlFor="shippingAddress" className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                      {t.checkout.shippingAddress}
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3.5 text-maroon-500 pointer-events-none">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <textarea
                        id="shippingAddress"
                        rows={3}
                        placeholder={t.checkout.addressPlaceholder}
                        {...register("shippingAddress")}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all resize-none"
                      />
                    </div>
                    {errors.shippingAddress && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.shippingAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                      {t.checkout.orderNotes}
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3.5 text-maroon-500 pointer-events-none">
                        <FileText className="w-4 h-4" />
                      </div>
                      <textarea
                        id="notes"
                        rows={2}
                        placeholder={t.checkout.notesPlaceholder}
                        {...register("notes")}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-maroon-100 p-6 sm:p-8 space-y-6">
                <div className="border-b border-maroon-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-maroon-900">{t.checkout.orderSummaryTitle}</h2>
                    <p className="text-xs text-maroon-700 mt-0.5">{cartItems.length} {t.checkout.uniqueItemCount}</p>
                  </div>
                  <ShoppingBag className="w-5 h-5 text-maroon-700" />
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const itemKey = item.productVariantId || item.productId;
                    return (
                      <div
                        key={itemKey}
                        className="flex items-center justify-between p-3.5 bg-off-white rounded-xl border border-maroon-100"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-maroon-200 flex items-center justify-center shrink-0 relative mr-3">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-maroon-300" />
                          )}
                        </div>

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
                              disabled={item.quantity <= 1}
                              onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                              className="p-1 text-maroon-800 hover:bg-maroon-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center font-bold font-mono text-xs text-maroon-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                              className="p-1 text-maroon-800 hover:bg-maroon-100 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(itemKey)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title={t.cartDrawer.removeItem}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-maroon-100 space-y-2.5 text-xs font-sans">
                  <div className="flex items-center justify-between text-maroon-700">
                    <span>{t.checkout.subtotal}</span>
                    <span className="font-mono font-semibold">৳{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-maroon-700">
                    <span>{t.checkout.deliveryCharge} ({deliveryZone === "inside_dhaka" ? t.checkout.insideDhaka : t.checkout.outsideDhaka})</span>
                    <span className="font-mono font-semibold">৳{deliveryCharge.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t border-maroon-100 flex items-center justify-between text-sm font-bold text-maroon-900">
                    <span>{t.checkout.totalAmount}</span>
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
                      <span>{t.checkout.processingOrder}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-cream" />
                      <span>{t.checkout.placeOrder}</span>
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
