import { Package } from "lucide-react";

export function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="mb-6 animate-pulse">
          <div className="w-32 h-4 bg-maroon-200/60 rounded" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-maroon-100 overflow-hidden grid grid-cols-1 md:grid-cols-2 animate-pulse">
          <div className="bg-maroon-100/40 p-8 sm:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-maroon-100 relative min-h-[320px]">
            <Package className="w-32 h-32 text-maroon-200/80" />
          </div>

          <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-8 bg-maroon-200/70 rounded-md w-3/4" />
                <div className="h-4 bg-maroon-100/80 rounded w-full" />
                <div className="h-4 bg-maroon-100/80 rounded w-5/6" />
              </div>

              <div className="pt-4 border-t border-maroon-100 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-3 bg-maroon-100/60 rounded w-12" />
                  <div className="h-8 bg-maroon-200/80 rounded w-24" />
                </div>
                <div className="w-28 h-7 bg-emerald-100/60 border border-emerald-200/60 rounded-sm" />
              </div>

              <div className="pt-2 space-y-2">
                <div className="h-3 bg-maroon-100/60 rounded w-28" />
                <div className="flex gap-2">
                  <div className="w-12 h-9 bg-maroon-100/70 border border-maroon-200/60 rounded-md" />
                  <div className="w-12 h-9 bg-maroon-100/70 border border-maroon-200/60 rounded-md" />
                  <div className="w-12 h-9 bg-maroon-100/70 border border-maroon-200/60 rounded-md" />
                  <div className="w-12 h-9 bg-maroon-100/70 border border-maroon-200/60 rounded-md" />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="h-3 bg-maroon-100/60 rounded w-24" />
                <div className="w-32 h-10 bg-maroon-100/60 border border-maroon-200/60 rounded-md" />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-maroon-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 bg-maroon-800/20 border border-maroon-200/60 rounded-md" />
                <div className="h-11 bg-maroon-100/70 border border-maroon-200/60 rounded-md" />
              </div>
              <div className="h-12 bg-maroon-900/30 rounded-md" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
