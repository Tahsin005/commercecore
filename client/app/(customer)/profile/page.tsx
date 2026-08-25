"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  MapPin,
  User,
  Lock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useMeQuery } from "@/hooks/useProfileQueries";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UnauthenticatedProfileState } from "@/components/profile/UnauthenticatedProfileState";
import { MyOrdersTab } from "@/components/profile/MyOrdersTab";
import { SavedAddressesTab } from "@/components/profile/SavedAddressesTab";
import { ProfileDetailsTab } from "@/components/profile/ProfileDetailsTab";
import { SecurityTab } from "@/components/profile/SecurityTab";
import { ProfileSkeleton } from "@/components/skeletons";

type ProfileTab = "orders" | "addresses" | "info" | "security";

export default function CustomerProfilePage() {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");

  // Refetch user profile from server to ensure state is synchronized
  useMeQuery(Boolean(isHydrated && isAuthenticated));

  if (!isHydrated) {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return <UnauthenticatedProfileState />;
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8 font-sans overflow-hidden">
      <ProfileHeader user={user} onEditProfileClick={() => setActiveTab("info")} />

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 bg-maroon-100/40 sm:bg-transparent p-1.5 sm:p-0 rounded-2xl sm:rounded-none border border-maroon-200/60 sm:border-0 sm:border-b sm:border-maroon-200/80 sm:pb-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200/80"
          }`}
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.profile.myOrdersTab || "My Orders"}</span>
        </button>

        <button
          onClick={() => setActiveTab("addresses")}
          className={`flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "addresses"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200/80"
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.profile.myAddressesTab || "Saved Addresses"}</span>
        </button>

        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "info"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200/80"
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.profile.editProfileTab || "Profile Details"}</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200/80"
          }`}
        >
          <Lock className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.profile.securityTab || "Security & Password"}</span>
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "orders" && <MyOrdersTab isAuthenticated={isAuthenticated} />}
        {activeTab === "addresses" && <SavedAddressesTab isAuthenticated={isAuthenticated} />}
        {activeTab === "info" && <ProfileDetailsTab user={user} />}
        {activeTab === "security" && <SecurityTab user={user} />}
      </div>
    </div>
  );
}
