export function OrderSuccessSkeleton() {
  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-maroon-100 overflow-hidden animate-pulse">
          <div className="bg-maroon-900 p-8 sm:p-10 text-white text-center space-y-4">
            <div className="w-14 h-14 bg-white/10 border border-maroon-700 rounded-full mx-auto" />
            <div className="h-8 bg-white/20 rounded-md w-56 mx-auto" />
            <div className="h-3 bg-white/10 rounded w-72 mx-auto" />
            <div className="h-7 bg-maroon-800 border border-maroon-700 rounded-full w-36 mx-auto" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="h-12 bg-emerald-50/60 border border-emerald-200/60 rounded-xl" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-maroon-100/40 rounded-xl border border-maroon-100 space-y-3">
                <div className="h-4 bg-maroon-200/60 rounded w-1/2" />
                <div className="h-4 bg-maroon-100/80 rounded w-3/4" />
                <div className="h-3 bg-maroon-100/60 rounded w-1/3" />
              </div>

              <div className="p-4 bg-maroon-100/40 rounded-xl border border-maroon-100 space-y-3">
                <div className="h-4 bg-maroon-200/60 rounded w-1/2" />
                <div className="h-4 bg-maroon-100/80 rounded w-full" />
                <div className="h-3 bg-maroon-100/60 rounded w-1/4" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-5 bg-maroon-200/60 rounded w-44" />
              <div className="border border-maroon-100 rounded-xl p-4 bg-maroon-100/30 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-maroon-200/60 rounded w-1/2" />
                  <div className="h-4 bg-maroon-200/70 rounded w-16" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-maroon-200/60 rounded w-2/3" />
                  <div className="h-4 bg-maroon-200/70 rounded w-16" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-maroon-100/40 rounded-xl border border-maroon-100 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 bg-maroon-100/60 rounded w-24" />
                <div className="h-3 bg-maroon-200/60 rounded w-16" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-maroon-100/60 rounded w-28" />
                <div className="h-3 bg-maroon-200/60 rounded w-12" />
              </div>
              <div className="pt-2 border-t border-maroon-200/60 flex justify-between">
                <div className="h-5 bg-maroon-200/70 rounded w-24" />
                <div className="h-6 bg-maroon-200/80 rounded w-20" />
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <div className="w-44 h-11 bg-maroon-900/30 rounded-md" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
