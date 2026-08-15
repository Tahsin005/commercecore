"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  KeyRound,
} from "lucide-react";

import { useOrderDetailsQuery } from "@/hooks/useOrderQueries";
import { OrderSuccessSkeleton } from "@/components/skeletons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useClaimAccountMutation } from "@/hooks/useAuthMutations";

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = use(params);
  const { t } = useLanguage();
  const { user } = useAuth();
  const claimMutation = useClaimAccountMutation();

  const [claimEmail, setClaimEmail] = useState<string>(
    user?.email && !user.email.startsWith("guest_") ? user.email : ""
  );
  const [claimPassword, setClaimPassword] = useState<string>("");

  // react Query hook for order receipt details
  const { data: response, isLoading, error } = useOrderDetailsQuery(orderNumber);

  const order = response?.data?.order;
  const items = response?.data?.items || [];

  const handleClaimAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (!claimPassword || claimPassword.length < 6) {
      toast.error(t.validation.passwordMin);
      return;
    }

    claimMutation.mutate(
      {
        email: claimEmail.trim() ? claimEmail.trim() : undefined,
        password: claimPassword,
      },
      {
        onSuccess: () => {
          toast.success(t.claimAccount.successToast);
          setClaimPassword("");
        },
        onError: (err) => {
          toast.error(err.message || t.common.error);
        },
      }
    );
  };

  if (isLoading) {
    return <OrderSuccessSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-maroon-100 text-center space-y-4">
            <Package className="w-12 h-12 text-maroon-300 mx-auto" />
            <h1 className="text-2xl font-serif font-bold text-maroon-900">{t.orderSuccess.orderNotFound}</h1>
            <p className="text-xs text-maroon-700">{t.orderSuccess.orderNotFound}</p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-maroon-900 text-white font-medium text-xs rounded-md shadow hover:bg-maroon-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.common.backToShop}</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-maroon-100 overflow-hidden">
          <div className="bg-maroon-900 p-8 sm:p-10 text-white text-center space-y-3">
            <div className="w-14 h-14 bg-white/10 border border-maroon-700 rounded-full flex items-center justify-center mx-auto text-cream shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-cream" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {t.orderSuccess.confirmedTitle}
            </h1>
            <p className="text-xs text-maroon-200 font-sans max-w-md mx-auto">
              {t.orderSuccess.confirmedDesc}
            </p>
            <div className="inline-block bg-maroon-800 border border-maroon-700 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-cream tracking-wide">
              {t.orderSuccess.orderNumber} #{order.orderNumber}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-900 text-xs font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {t.orderSuccess.paymentMethod}: <strong>{t.orderSuccess.codLabel}</strong> ({t.orderSuccess.codNoticeAmount(order.total.toFixed(2))})
              </span>
            </div>

            {/* Option 1: Claim Account Card for Guest Accounts */}
            {user && user.hasPassword === false && (
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-maroon-900">
                      {t.claimAccount.title}
                    </h3>
                    <p className="text-xs text-maroon-700 mt-0.5 leading-relaxed">
                      {t.claimAccount.subtitle}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleClaimAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-maroon-900 mb-1">
                      {t.claimAccount.emailLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-maroon-500">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        placeholder={t.claimAccount.emailPlaceholder}
                        value={claimEmail}
                        onChange={(e) => setClaimEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white text-maroon-900 border border-maroon-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-maroon-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-maroon-900 mb-1">
                      {t.claimAccount.passwordLabel} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-maroon-500">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder={t.claimAccount.passwordPlaceholder}
                        value={claimPassword}
                        onChange={(e) => setClaimPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white text-maroon-900 border border-maroon-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-maroon-700"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <button
                      type="submit"
                      disabled={claimMutation.isPending}
                      className="w-full py-2.5 px-4 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-md shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                    >
                      {claimMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cream" />
                          <span>{t.claimAccount.submitting}</span>
                        </>
                      ) : (
                        <span>{t.claimAccount.submitBtn}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {user && user.hasPassword === true && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-900 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t.claimAccount.claimedBadge}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 bg-off-white rounded-xl border border-maroon-100 space-y-2">
                <h3 className="font-semibold text-maroon-900 border-b border-maroon-200/60 pb-1 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-maroon-700" />
                  <span>{t.orderSuccess.customerDetails}</span>
                </h3>
                <p className="text-maroon-800 font-medium">{order.customerName}</p>
                <p className="text-maroon-700 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-maroon-500" />
                  <span>{order.phone}</span>
                </p>
              </div>

              <div className="p-4 bg-off-white rounded-xl border border-maroon-100 space-y-2">
                <h3 className="font-semibold text-maroon-900 border-b border-maroon-200/60 pb-1 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-maroon-700" />
                  <span>{t.orderSuccess.shippingAddress}</span>
                </h3>
                <p className="text-maroon-800 font-medium leading-relaxed">{order.shippingAddress}</p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-maroon-600 bg-white px-2 py-0.5 rounded border border-maroon-200">
                  {order.deliveryZone === "inside_dhaka" ? t.checkout.insideDhaka : t.checkout.outsideDhaka}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base text-maroon-900 flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-maroon-700" />
                <span>{t.orderSuccess.itemsSummary}</span>
              </h3>

              <div className="divide-y divide-maroon-100 border border-maroon-100 rounded-xl overflow-hidden bg-off-white/50">
                {items.map((item: any, idx: number) => {
                  const imageUrl = item.imageUrl || item.product?.images?.[0] || item.product?.imageUrl || item.productId?.images?.[0];

                  return (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-maroon-200 flex items-center justify-center shrink-0 relative">
                          {imageUrl ? (
                            <Image src={imageUrl} alt={item.productName} fill sizes="40px" className="object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-maroon-300" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-semibold text-maroon-900">{item.productName}</h4>
                            {item.size && (
                              <span className="text-[10px] font-bold font-mono text-maroon-700 bg-white border border-maroon-200 px-1.5 py-0.2 rounded-sm">
                                {item.size}
                              </span>
                            )}
                          </div>
                          <span className="text-maroon-600 text-[11px] font-mono">
                            ৳{item.unitPrice.toFixed(2)} × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-maroon-900">
                        ৳{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-off-white rounded-xl border border-maroon-100 space-y-2 text-xs font-sans">
              <div className="flex justify-between text-maroon-700">
                <span>{t.orderSuccess.itemsSubtotal}</span>
                <span className="font-mono font-semibold">৳{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-maroon-700">
                <span>{t.orderSuccess.deliveryCharge}</span>
                <span className="font-mono font-semibold">৳{order.deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-maroon-200/60 flex justify-between text-sm font-bold text-maroon-900">
                <span>{t.orderSuccess.grandTotal}</span>
                <span className="font-mono text-base text-maroon-900">৳{order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-md shadow transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-cream" />
                <span>{t.orderSuccess.continueShopping}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
