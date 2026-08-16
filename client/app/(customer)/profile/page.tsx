"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  MapPin,
  User,
  Lock,
  Loader2,
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

type ProfileTab = "orders" | "addresses" | "info" | "security";

export default function CustomerProfilePage() {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");

  // Refetch user profile from server to ensure state is synchronized
  useMeQuery(Boolean(isHydrated && isAuthenticated));

  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
        <p className="text-sm font-medium text-maroon-700">{t.common.loading || "Loading profile..."}</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <UnauthenticatedProfileState />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans w-full overflow-hidden">
      <ProfileHeader user={user} onEditProfileClick={() => setActiveTab("info")} />

      <div className="flex items-center gap-2 border-b border-maroon-200/80 pb-3 overflow-x-auto max-w-full w-full">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "orders"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.profile.myOrdersTab || "My Orders"}</span>
        </button>

        <button
          onClick={() => setActiveTab("addresses")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "addresses"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t.profile.myAddressesTab || "Saved Addresses"}</span>
        </button>

        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "info"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.profile.editProfileTab || "Profile Details"}</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "security"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{t.profile.securityTab || "Security & Password"}</span>
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
