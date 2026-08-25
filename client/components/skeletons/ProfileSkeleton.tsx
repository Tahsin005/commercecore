import React from "react";
import { ShoppingBag, MapPin, User, Lock } from "lucide-react";

export function ProfileSkeleton() {
  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8 font-sans overflow-hidden animate-pulse">
      <div className="bg-maroon-900 p-6 sm:p-8 rounded-3xl text-cream shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-maroon-800 max-w-full overflow-hidden">
        <div className="space-y-2 max-w-full min-w-0 flex-1">
          <div className="flex items-center space-x-3 max-w-full min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-maroon-800/80 border border-maroon-700/60 flex items-center justify-center shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="w-48 sm:w-56 h-6 bg-maroon-800/80 rounded-md" />
              <div className="w-36 sm:w-44 h-3.5 bg-maroon-800/50 rounded" />
            </div>
          </div>
          <div className="w-full max-w-md h-3 bg-maroon-800/40 rounded pt-1" />
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-28 h-9 bg-maroon-800/80 rounded-xl border border-maroon-700/50" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 bg-maroon-100/40 sm:bg-transparent p-1.5 sm:p-0 rounded-2xl sm:rounded-none border border-maroon-200/60 sm:border-0 sm:border-b sm:border-maroon-200/80 sm:pb-3">
        <div className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2.5 rounded-xl bg-maroon-900/30 border border-maroon-900/40 text-maroon-900 text-xs font-bold w-full sm:w-auto">
          <ShoppingBag className="w-4 h-4 opacity-40 shrink-0" />
          <div className="w-20 h-3.5 bg-maroon-900/30 rounded" />
        </div>

        <div className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white border border-maroon-200/80 text-maroon-800 text-xs font-bold w-full sm:w-auto">
          <MapPin className="w-4 h-4 opacity-30 shrink-0" />
          <div className="w-24 h-3.5 bg-maroon-100/70 rounded" />
        </div>

        <div className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white border border-maroon-200/80 text-maroon-800 text-xs font-bold w-full sm:w-auto">
          <User className="w-4 h-4 opacity-30 shrink-0" />
          <div className="w-20 h-3.5 bg-maroon-100/70 rounded" />
        </div>

        <div className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white border border-maroon-200/80 text-maroon-800 text-xs font-bold w-full sm:w-auto">
          <Lock className="w-4 h-4 opacity-30 shrink-0" />
          <div className="w-28 h-3.5 bg-maroon-100/70 rounded" />
        </div>
      </div>

      <div className="space-y-4 max-w-full">
        <div className="block md:hidden space-y-3.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-maroon-100 p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-maroon-100/70 pb-2.5">
                <div className="space-y-1.5">
                  <div className="w-28 h-4 bg-maroon-200/60 rounded" />
                  <div className="w-20 h-3 bg-maroon-100/60 rounded" />
                </div>
                <div className="w-20 h-5 bg-amber-100/70 rounded-full" />
              </div>

              <div className="bg-off-white/80 p-2.5 rounded-xl border border-maroon-100/60 space-y-2">
                <div className="w-24 h-3 bg-maroon-100/60 rounded" />
                <div className="flex justify-between items-center">
                  <div className="w-36 h-3.5 bg-maroon-200/60 rounded" />
                  <div className="w-14 h-3.5 bg-maroon-200/60 rounded" />
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="w-16 h-2.5 bg-maroon-100/50 rounded" />
                  <div className="w-20 h-5 bg-maroon-200/70 rounded" />
                </div>
                <div className="w-24 h-8 bg-maroon-900/30 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden w-full max-w-full">
          <div className="w-full">
            <div className="bg-maroon-900 px-4 py-3.5 grid grid-cols-12 gap-4">
              <div className="col-span-3 h-4 bg-maroon-800/80 rounded w-24" />
              <div className="col-span-4 h-4 bg-maroon-800/80 rounded w-32" />
              <div className="col-span-2 h-4 bg-maroon-800/80 rounded w-16 mx-auto" />
              <div className="col-span-2 h-4 bg-maroon-800/80 rounded w-20 ml-auto" />
              <div className="col-span-1 h-4 bg-maroon-800/80 rounded w-12 mx-auto" />
            </div>

            <div className="divide-y divide-maroon-100">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-4 py-4 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 space-y-1.5">
                    <div className="w-28 h-4 bg-maroon-200/70 rounded" />
                    <div className="w-20 h-3 bg-maroon-100/60 rounded" />
                  </div>

                  <div className="col-span-4 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="w-40 h-3.5 bg-maroon-200/60 rounded" />
                      <div className="w-14 h-3.5 bg-maroon-200/60 rounded" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-32 h-3 bg-maroon-100/50 rounded" />
                      <div className="w-12 h-3 bg-maroon-100/50 rounded" />
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <div className="w-20 h-6 bg-amber-100/60 rounded-full" />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <div className="w-20 h-5 bg-maroon-200/70 rounded" />
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <div className="w-20 h-7 bg-maroon-100/70 border border-maroon-200/60 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
