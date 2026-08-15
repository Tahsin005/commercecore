"use client";

import Link from "next/link";
import { LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-maroon-100 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs font-sans">
      <div className="flex items-center space-x-3">
        <span className="text-xs font-bold uppercase tracking-wider text-maroon-700 bg-maroon-50 border border-maroon-200/80 px-2.5 py-1 rounded-md flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-maroon-700" />
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="text-xs font-semibold text-maroon-800 hover:text-maroon-900 transition-colors flex items-center space-x-1.5 bg-off-white px-3 py-1.5 rounded-md border border-maroon-200"
        >
          <ExternalLink className="w-3.5 h-3.5 text-maroon-600" />
          <span>View Shop</span>
        </Link>

        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-maroon-100">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-maroon-900 text-cream rounded-full flex items-center justify-center font-bold text-xs font-mono">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-maroon-900 block leading-none">
                  {user.name}
                </span>
                <span className="text-[10px] text-maroon-500 font-medium">Administrator</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-maroon-700 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
