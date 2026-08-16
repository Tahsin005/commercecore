"use client";

import React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function UnauthenticatedProfileState() {
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-maroon-100 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 bg-maroon-50 rounded-full flex items-center justify-center mx-auto text-maroon-900">
        <User className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-serif font-bold text-maroon-900">
          {t.profile.unauthTitle || "Sign in to view your profile"}
        </h2>
        <p className="text-xs text-maroon-700">
          {t.profile.unauthSubtitle || "Please log in or register to access your saved delivery addresses, order history, and account settings."}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href="/login?redirect=/profile"
          className="flex-1 px-5 py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-xl shadow transition-all text-center"
        >
          {t.profile.loginBtn || "Login"}
        </Link>
        <Link
          href="/signup?redirect=/profile"
          className="flex-1 px-5 py-2.5 bg-off-white hover:bg-maroon-50 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-xl transition-all text-center"
        >
          {t.profile.registerBtn || "Register"}
        </Link>
      </div>
    </div>
  );
}
