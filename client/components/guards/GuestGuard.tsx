"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || isAuthenticated) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 bg-white p-8 px-10 rounded-2xl shadow-xl border border-maroon-100">
          <Image
            src="/logo.png"
            alt="CommerceCore Logo"
            width={64}
            height={64}
            className="w-16 h-16 object-contain"
            priority
          />
          <div className="flex items-center space-x-2 text-maroon-700">
            <Loader2 className="w-4 h-4 animate-spin text-maroon-700" />
            <span className="text-xs font-semibold uppercase tracking-wider text-maroon-900">
              Checking session status...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
