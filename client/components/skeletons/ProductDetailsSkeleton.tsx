import { Package } from "lucide-react";

export function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-6 flex-1 space-y-8 animate-pulse">
        <div className="mb-4">
          <div className="w-28 h-4 bg-maroon-200/60 rounded-md" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-maroon-100 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-5 space-y-3">
            <div className="aspect-[4/5] rounded-2xl bg-maroon-100/50 border border-maroon-200/60 flex items-center justify-center relative overflow-hidden shadow-inner">
              <Package className="w-24 h-24 sm:w-28 sm:h-28 text-maroon-200/70 animate-pulse" />
              <div className="absolute top-3 left-3 w-16 h-6 bg-red-600/20 rounded-md" />
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-20 aspect-[4/5] rounded-xl bg-maroon-100/40 border border-maroon-200/50 shrink-0"
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="pb-3 border-b border-maroon-100/70 space-y-2">
                <div className="w-20 h-4 bg-maroon-100/70 rounded" />
                <div className="h-7 sm:h-8 bg-maroon-200/70 rounded-lg w-4/5" />
                <div className="flex items-center space-x-3 pt-1">
                  <div className="w-28 h-5 bg-off-white border border-maroon-200/60 rounded" />
                  <div className="w-24 h-4 bg-emerald-100/60 rounded" />
                </div>
              </div>

              <div className="py-2.5 border-b border-maroon-100/70 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="w-12 h-3 bg-maroon-100/60 rounded" />
                  <div className="w-32 h-8 bg-maroon-200/80 rounded-lg" />
                </div>
                <div className="w-28 h-7 bg-emerald-100/70 border border-emerald-200/60 rounded-lg" />
              </div>

              <div className="space-y-2 pt-1">
                <div className="w-24 h-3.5 bg-maroon-100/60 rounded" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-14 h-9 bg-maroon-100/60 border border-maroon-200/60 rounded-xl" />
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="w-20 h-3.5 bg-maroon-100/60 rounded" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-9 h-9 bg-maroon-200/60 border border-maroon-200/80 rounded-lg" />
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="w-20 h-3.5 bg-maroon-100/60 rounded" />
                <div className="w-32 h-10 bg-off-white border border-maroon-200/60 rounded-lg" />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-maroon-100/80">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 bg-maroon-800/25 border border-maroon-300/40 rounded-xl" />
                <div className="h-11 bg-maroon-100/60 border border-maroon-200/60 rounded-xl" />
              </div>
              <div className="h-12 bg-maroon-900/30 rounded-xl" />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 bg-off-white/80 rounded-xl border border-maroon-100 space-y-2 shadow-2xs"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-maroon-200/60" />
                  <div className="w-28 h-4 bg-maroon-200/70 rounded" />
                </div>
                <div className="w-full h-3 bg-maroon-100/60 rounded" />
                <div className="w-4/5 h-3 bg-maroon-100/60 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex space-x-6 border-b border-maroon-100 pb-3">
            <div className="w-28 h-6 bg-maroon-200/70 rounded" />
            <div className="w-28 h-6 bg-maroon-100/50 rounded" />
            <div className="w-28 h-6 bg-maroon-100/50 rounded" />
          </div>
          <div className="space-y-2.5 pt-2">
            <div className="w-full h-4 bg-maroon-100/60 rounded" />
            <div className="w-5/6 h-4 bg-maroon-100/60 rounded" />
            <div className="w-3/4 h-4 bg-maroon-100/60 rounded" />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-maroon-100">
            <div className="w-40 h-6 bg-maroon-200/70 rounded-md" />
            <div className="w-20 h-4 bg-maroon-100/60 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-xs border border-maroon-100 overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-[4/5] bg-maroon-100/40 flex items-center justify-center relative">
                  <Package className="w-12 h-12 text-maroon-200/60" />
                </div>
                <div className="p-3 sm:p-4 space-y-2.5">
                  <div className="w-3/4 h-4 bg-maroon-200/60 rounded" />
                  <div className="w-1/2 h-4 bg-maroon-100/70 rounded" />
                  <div className="w-full h-8 bg-maroon-800/15 rounded-lg mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
