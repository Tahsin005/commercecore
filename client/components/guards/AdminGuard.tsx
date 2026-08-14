"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push("/login");
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-3 bg-white p-8 px-10 rounded-2xl shadow-xl border border-maroon-100">
          <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
          <span className="text-xs font-semibold uppercase tracking-wider text-maroon-900">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center font-sans p-4">
        <div className="bg-white p-8 max-w-md w-full rounded-2xl shadow-xl border border-maroon-100 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-xl font-serif font-bold text-maroon-900">Access Denied</h2>
          <p className="text-xs text-maroon-700">
            You do not have administrator permissions to access the Admin Panel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
