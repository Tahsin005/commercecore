"use client";

import React from "react";
import { AlertTriangle, KeyRound, LogOut, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface LogoutWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  onOpenClaimModal: () => void;
}

export function LogoutWarningModal({
  isOpen,
  onClose,
  onConfirmLogout,
  onOpenClaimModal,
}: LogoutWarningModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-maroon-100 w-full max-w-md overflow-hidden relative p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-maroon-500 hover:text-maroon-900 rounded-full hover:bg-maroon-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-serif font-bold text-maroon-900">
            {t.logoutModal.title}
          </h3>
          <p className="text-xs text-maroon-700 font-sans leading-relaxed">
            {t.logoutModal.description}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenClaimModal();
            }}
            className="w-full py-3 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.99] text-white font-semibold text-xs rounded-md transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-cream" />
            <span>{t.logoutModal.setPasswordBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmLogout();
            }}
            className="w-full py-2.5 px-4 bg-off-white hover:bg-red-50 text-red-600 font-semibold text-xs rounded-md border border-maroon-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logoutModal.logoutAnywayBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
