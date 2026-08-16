"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUpdateProfileMutation } from "@/hooks/useProfileQueries";
import { User as UserType } from "@/store/useAuthStore";
import toast from "react-hot-toast";

interface ProfileDetailsTabProps {
  user: UserType | null;
}

export function ProfileDetailsTab({ user }: ProfileDetailsTabProps) {
  const { t } = useLanguage();
  const updateProfileMutation = useUpdateProfileMutation();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(profileForm);
      toast.success(t.profile.profileUpdatedSuccess || "Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    }
  };

  return (
    <div className="max-w-xl bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6">
      <div>
        <h3 className="font-serif font-bold text-lg text-maroon-900">
          {t.profile.updateProfileTitle || "Update Profile Info"}
        </h3>
        <p className="text-xs text-maroon-700 mt-0.5">
          Update your account display name, primary email address, and contact number.
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-maroon-900 flex items-center">
            <User className="w-3.5 h-3.5 mr-1 text-maroon-700" />
            {t.profile.fullNameInput || "Full Name *"}
          </label>
          <input
            type="text"
            required
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-maroon-900 flex items-center">
            <Mail className="w-3.5 h-3.5 mr-1 text-maroon-700" />
            {t.profile.emailInput || "Email Address *"}
          </label>
          <input
            type="email"
            required
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-maroon-900 flex items-center">
            <Phone className="w-3.5 h-3.5 mr-1 text-maroon-700" />
            {t.profile.phoneInput || "Phone Number *"}
          </label>
          <input
            type="tel"
            required
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30 font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="w-full py-3 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
        >
          {updateProfileMutation.isPending ? "Saving changes..." : (t.profile.saveProfileBtn || "Save Profile Changes")}
        </button>
      </form>
    </div>
  );
}
