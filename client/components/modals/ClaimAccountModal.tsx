"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Lock, Mail, Loader2, X, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useClaimAccountMutation } from "@/hooks/useAuthMutations";
import { useAuth } from "@/hooks/useAuth";

interface ClaimAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClaimAccountModal({ isOpen, onClose, onSuccess }: ClaimAccountModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const claimMutation = useClaimAccountMutation();

  const [email, setEmail] = useState<string>(
    user?.email && !user.email.startsWith("guest_") ? user.email : ""
  );
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (isOpen && user?.email && !user.email.startsWith("guest_") && !email) {
      setEmail(user.email);
    }
  }, [isOpen, user, email]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      toast.error(t.validation.passwordMin);
      return;
    }

    claimMutation.mutate(
      {
        email: email.trim() ? email.trim() : undefined,
        password,
      },
      {
        onSuccess: () => {
          toast.success(t.claimAccount.successToast);
          setPassword("");
          if (onSuccess) onSuccess();
          onClose();
        },
        onError: (err) => {
          toast.error(err.message || t.common.error);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-maroon-100 w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-maroon-500 hover:text-maroon-900 rounded-full hover:bg-maroon-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-maroon-900 text-white p-6 sm:p-8 text-center space-y-2">
          <div className="w-12 h-12 bg-white/10 border border-maroon-700 rounded-full flex items-center justify-center mx-auto text-cream shadow-inner">
            <ShieldCheck className="w-6 h-6 text-cream" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white">
            {t.claimAccount.title}
          </h2>
          <p className="text-xs text-maroon-200 font-sans max-w-xs mx-auto">
            {t.claimAccount.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div>
            <label htmlFor="claimEmail" className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
              {t.claimAccount.emailLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="claimEmail"
                type="email"
                placeholder={t.claimAccount.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="claimPassword" className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
              {t.claimAccount.passwordLabel} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="claimPassword"
                type="password"
                required
                minLength={6}
                placeholder={t.claimAccount.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={claimMutation.isPending}
            className="w-full py-3.5 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.99] text-white font-semibold text-sm rounded-md transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-60 mt-2"
          >
            {claimMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cream" />
                <span>{t.claimAccount.submitting}</span>
              </>
            ) : (
              <span>{t.claimAccount.submitBtn}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
