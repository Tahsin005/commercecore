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

  return (
    <GuestGuard>
      <div className="min-h-screen bg-off-white text-text-main flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <main className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-maroon-100 overflow-hidden flex flex-col md:flex-row transition-all">
          <div className="w-full md:w-2/5 bg-maroon-900 p-8 sm:p-10 text-white flex flex-col items-center justify-center text-center order-1">
            <div className="p-3 bg-white/10 border border-maroon-700/60 rounded-2xl backdrop-blur-sm mb-4 shadow-inner">
              <Image
                src="/logo.png"
                alt="Rupzon Collection Logo"
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                priority
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
              {t.common.commerceCore}
            </h2>
            <p className="text-xs text-maroon-200 mt-2 max-w-xs leading-relaxed font-sans">
              {t.signup.brandTag}
            </p>
          </div>

          <div className="w-full md:w-3/5 p-6 sm:p-10 flex flex-col justify-center order-2">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-900 tracking-tight">
                {t.signup.title}
              </h1>
              <p className="text-xs sm:text-sm text-maroon-700 mt-1">
                {t.signup.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 transition-all ${
                      errors.name ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

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
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 transition-all ${
                      errors.email ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
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
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 transition-all ${
                      errors.phone ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>

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
                    className={`w-full pl-10 pr-10 py-2.5 bg-off-white text-maroon-900 border rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 transition-all ${
                      errors.password ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-maroon-500 hover:text-maroon-800 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
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
                    className={`w-full pl-10 pr-10 py-2.5 bg-off-white text-maroon-900 border rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 focus:border-maroon-700 transition-all ${
                      errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-maroon-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-maroon-500 hover:text-maroon-800 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full py-3 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.99] text-white font-medium text-sm rounded-md transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-60"
              >
                {signupMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cream" />
                    <span>{t.signup.creatingAccount}</span>
                  </>
                ) : (
                  <>
                    <span>{t.signup.createAccountBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 text-center border-t border-maroon-100">
              <p className="text-xs text-maroon-700 font-sans">
                {t.signup.hasAccount}{" "}
                <Link
                  href="/login"
                  className="font-semibold text-maroon-900 hover:underline transition-all"
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
