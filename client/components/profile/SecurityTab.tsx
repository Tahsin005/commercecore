"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useChangePasswordMutation } from "@/hooks/useProfileQueries";
import { User as UserType } from "@/store/useAuthStore";
import toast from "react-hot-toast";

interface SecurityTabProps {
  user: UserType | null;
}

export function SecurityTab({ user }: SecurityTabProps) {
  const { t } = useLanguage();
  const changePasswordMutation = useChangePasswordMutation();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t.profile.passwordsDoNotMatch || "New passwords do not match!");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword || undefined,
        newPassword: passwordForm.newPassword,
      });
      toast.success(t.profile.passwordChangedSuccess || "Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    }
  };

  return (
    <div className="max-w-xl bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6">
      <div>
        <h3 className="font-serif font-bold text-lg text-maroon-900">
          {t.profile.changePasswordTitle || "Account Security & Password"}
        </h3>
        <p className="text-xs text-maroon-700 mt-0.5">
          {t.profile.changePasswordDesc || "Change your account password to ensure your profile and order history remain secure."}
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        {user?.hasPassword && (
          <div className="space-y-1.5">
            <label htmlFor="current-password" className="text-xs font-semibold text-maroon-900">
              {t.profile.currentPasswordInput || "Current Password"}
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrentPass ? "text" : "password"}
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 pr-10 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                aria-label={showCurrentPass ? "Hide current password" : "Show current password"}
                title={showCurrentPass ? "Hide current password" : "Show current password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-600 hover:text-maroon-900 cursor-pointer"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-xs font-semibold text-maroon-900">
            {t.profile.newPasswordInput || "New Password *"}
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNewPass ? "text" : "password"}
              required
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 pr-10 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
            />
            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              aria-label={showNewPass ? "Hide new password" : "Show new password"}
              title={showNewPass ? "Hide new password" : "Show new password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-600 hover:text-maroon-900 cursor-pointer"
            >
              {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-xs font-semibold text-maroon-900">
            {t.profile.confirmPasswordInput || "Confirm New Password *"}
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={6}
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
          />
        </div>

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="w-full py-3 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
        >
          {changePasswordMutation.isPending ? (t.profile.updatingPassword || "Updating password...") : (t.profile.changePasswordBtn || "Update Password")}
        </button>
      </form>
    </div>
  );
}
