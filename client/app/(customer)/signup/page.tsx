"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { getSignupSchema, SignupInput } from "@/lib/validations/auth";
import { useSignupMutation } from "@/hooks/useAuthMutations";
import { useSyncCartMutation } from "@/hooks/useCartQueries";
import { useSyncWishlistMutation } from "@/hooks/useWishlistQueries";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { GuestGuard } from "@/components/guards/GuestGuard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const signupMutation = useSignupMutation();
  const syncCartMutation = useSyncCartMutation();
  const syncWishlistMutation = useSyncWishlistMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(getSignupSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignupInput) => {
    const { confirmPassword, ...signupPayload } = data;
    signupMutation.mutate(signupPayload, {
      onSuccess: async () => {
        toast.success(t.signup.signupSuccess);
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
          if (lower.includes("already exist") || lower.includes("already in use")) {
            message = t.authErrors.alreadyExists;
          } else if (lower.includes("invalid credential") || lower.includes("invalid email or password")) {
            message = t.authErrors.invalidCredentials;
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
        <main className="w-full max-w-5xl lg:max-w-6xl min-h-[640px] lg:min-h-[700px] bg-white rounded-3xl shadow-2xl shadow-maroon-950/15 border border-maroon-100/90 overflow-hidden flex flex-col md:flex-row transition-all">
          <div className="w-full md:w-5/12 bg-maroon-900 p-8 sm:p-12 lg:p-14 text-white flex flex-col items-center justify-center text-center relative overflow-hidden order-1">
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-maroon-800 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-maroon-700 rounded-full blur-3xl opacity-40 pointer-events-none" />

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
                  {t.signup.brandTag}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-between order-2">
            <div>
              <Link
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-maroon-700 hover:text-maroon-950 mb-6 transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>{t.common.backToShop || "Back to Shop"}</span>
              </Link>

              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-maroon-900 tracking-tight">
                  {t.signup.title}
                </h1>
                <p className="text-xs sm:text-sm text-maroon-700 mt-1.5">
                  {t.signup.subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5"
                  >
                    {t.signup.nameLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      placeholder={t.signup.namePlaceholder}
                      {...register("name")}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-off-white text-maroon-900 border rounded-xl text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 shadow-2xs transition-all ${
                        errors.name ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5"
                    >
                      {t.signup.emailLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        placeholder={t.signup.emailPlaceholder}
                        {...register("email")}
                        className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-off-white text-maroon-900 border rounded-xl text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 shadow-2xs transition-all ${
                          errors.email ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5"
                    >
                      {t.signup.phoneLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        placeholder={t.signup.phonePlaceholder}
                        {...register("phone")}
                        className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-off-white text-maroon-900 border rounded-xl text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 shadow-2xs transition-all ${
                          errors.phone ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5"
                    >
                      {t.signup.passwordLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-off-white text-maroon-900 border rounded-xl text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 shadow-2xs transition-all ${
                          errors.password ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-maroon-500 hover:text-maroon-800 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5"
                    >
                      {t.signup.confirmPasswordLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-off-white text-maroon-900 border rounded-xl text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 shadow-2xs transition-all ${
                          errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-maroon-500 hover:text-maroon-800 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="w-full py-3 sm:py-3.5 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60"
                  >
                    {signupMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-cream" />
                        <span>{t.signup.creatingAccount}</span>
                      </>
                    ) : (
                      <>
                        <span>{t.signup.createAccountBtn}</span>
                        <ArrowRight className="w-4 h-4 text-cream" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 text-center border-t border-maroon-100">
              <p className="text-xs sm:text-sm text-maroon-700 font-sans">
                {t.signup.hasAccount}{" "}
                <Link
                  href="/login"
                  className="font-bold text-maroon-900 hover:text-maroon-700 underline underline-offset-2 transition-all ml-1"
                >
                  {t.signup.signInLink}
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </GuestGuard>
  );
}
