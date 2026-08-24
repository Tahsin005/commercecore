"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { getLoginSchema, LoginInput } from "@/lib/validations/auth";
import { useLoginMutation } from "@/hooks/useAuthMutations";
import { useSyncCartMutation } from "@/hooks/useCartQueries";
import { useSyncWishlistMutation } from "@/hooks/useWishlistQueries";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { GuestGuard } from "@/components/guards/GuestGuard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const syncCartMutation = useSyncCartMutation();
  const syncWishlistMutation = useSyncWishlistMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data, {
      onSuccess: async () => {
        toast.success(t.login.welcomeSuccess);
        const guestCartItems = useCartStore.getState().items;
        if (guestCartItems.length > 0) {
          try {
            await syncCartMutation.mutateAsync(
              guestCartItems.map((i) => ({
                productVariantId: i.productVariantId,
                quantity: i.quantity,
              }))
            );
            useCartStore.getState().clearCart();
          } catch (e) {
            console.error("Failed to sync guest cart:", e);
          }
        }

        const guestWishlistItems = useWishlistStore.getState().items;
        if (guestWishlistItems.length > 0) {
          try {
            await syncWishlistMutation.mutateAsync(
              guestWishlistItems.map((i) => ({
                productVariantId: i.productVariantId,
              }))
            );
            useWishlistStore.getState().clearWishlist();
          } catch (e) {
            console.error("Failed to sync guest wishlist:", e);
          }
        }
        router.push("/");
      },
      onError: (error) => {
        const errorMsg = error?.message;
        let message = t.common.error;
        if (errorMsg) {
          const lower = errorMsg.toLowerCase();
          if (lower.includes("invalid credential") || lower.includes("invalid email or password")) {
            message = t.authErrors.invalidCredentials;
          } else if (lower.includes("already exist") || lower.includes("already in use")) {
            message = t.authErrors.alreadyExists;
          } else if (lower.includes("not found")) {
            message = t.authErrors.userNotFound;
          } else {
            message = errorMsg;
          }
        }
        toast.error(message);
      },
    });
  };

  const brandNameParts = (t.common.rupzonCollection || "Rupzon Collection").split(" ");
  const brandFirst = brandNameParts[0] || "Rupzon";
  const brandSecond = brandNameParts.slice(1).join(" ") || "Collection";

  return (
    <GuestGuard>
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 flex-1 flex items-center justify-center font-sans">
        <main className="w-full max-w-5xl lg:max-w-6xl min-h-[580px] lg:min-h-[620px] bg-white rounded-3xl shadow-2xl shadow-maroon-950/15 border border-maroon-100/90 overflow-hidden flex flex-col md:flex-row transition-all">
          <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-between order-2 md:order-1">
            <div>
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-maroon-700 hover:text-maroon-950 mb-6 transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>{t.common.backToShop || "Back to Shop"}</span>
              </Link>

              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-maroon-900 tracking-tight">
                  {t.login.title}
                </h1>
                <p className="text-xs sm:text-sm text-maroon-700 mt-1.5">
                  {t.login.subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5"
                  >
                    {t.login.identifierLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="identifier"
                      type="text"
                      placeholder={t.login.identifierPlaceholder}
                      {...register("identifier")}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-off-white text-maroon-900 border rounded-xl text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 shadow-2xs transition-all ${
                        errors.identifier ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                      }`}
                    />
                  </div>
                  {errors.identifier && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{errors.identifier.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5"
                  >
                    {t.login.passwordLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t.login.passwordPlaceholder}
                      {...register("password")}
                      className={`w-full pl-10 pr-11 py-2.5 sm:py-3 bg-off-white text-maroon-900 border rounded-xl text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 shadow-2xs transition-all ${
                        errors.password ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-maroon-500 hover:text-maroon-800 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full py-3 sm:py-3.5 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-cream" />
                        <span>{t.login.signingIn}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.login.signInBtn}</span>
                        <ArrowRight className="w-4 h-4 text-cream" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 pt-4 text-center border-t border-maroon-100">
              <p className="text-xs sm:text-sm text-maroon-700 font-sans">
                {t.login.noAccount}{" "}
                <Link
                  href="/signup"
                  className="font-bold text-maroon-900 hover:text-maroon-700 underline underline-offset-2 transition-all ml-1"
                >
                  {t.login.signUpLink}
                </Link>
              </p>
            </div>
          </div>

          <div className="w-full md:w-5/12 bg-maroon-900 p-8 sm:p-12 lg:p-14 text-white flex flex-col items-center justify-center text-center relative overflow-hidden order-1 md:order-2">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-maroon-800 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-maroon-700 rounded-full blur-3xl opacity-40 pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center my-auto space-y-6">
              <div className="relative group">
                <Image
                  src="/logo.png"
                  alt="Rupzon Collection Logo"
                  width={240}
                  height={240}
                  className="w-44 h-44 sm:w-52 sm:h-52 lg:w-60 lg:h-60 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide">
                  {brandFirst} <span className="text-cream">{brandSecond}</span>
                </h2>
                <div className="w-12 h-0.5 bg-cream/50 mx-auto my-2" />
                <p className="text-xs sm:text-sm text-maroon-200 max-w-xs leading-relaxed font-sans">
                  {t.login.brandTag}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </GuestGuard>
  );
}
