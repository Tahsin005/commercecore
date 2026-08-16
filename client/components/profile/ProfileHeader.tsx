"use client";

import React from "react";
import { Edit2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { User as UserType } from "@/store/useAuthStore";

interface ProfileHeaderProps {
  user: UserType;
  onEditProfileClick: () => void;
}

export function ProfileHeader({ user, onEditProfileClick }: ProfileHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-maroon-900 p-6 sm:p-8 rounded-3xl text-cream shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-maroon-800">
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-maroon-800 border border-maroon-700 flex items-center justify-center text-white font-serif font-bold text-xl shadow-inner">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
              {user.name || "Customer Account"}
            </h1>
            <p className="text-xs text-maroon-200 font-mono flex items-center gap-2 mt-0.5">
              <span>{user.email || user.phone}</span>
              {user.isAdmin && (
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              )}
            </p>
          </div>
        </div>
        <p className="text-xs text-maroon-200 pt-1 max-w-xl">
          {t.profile.subtitle || "Manage your profile details, delivery addresses, order history, and security settings."}
        </p>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={onEditProfileClick}
          className="px-4 py-2 bg-maroon-800 hover:bg-maroon-700 text-cream text-xs font-semibold rounded-xl border border-maroon-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}
