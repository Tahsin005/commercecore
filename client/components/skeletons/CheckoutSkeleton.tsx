export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-maroon-100 p-6 sm:p-8 space-y-6">
              <div className="border-b border-maroon-100 pb-4 space-y-2">
                <div className="h-6 bg-maroon-200/70 rounded w-1/2" />
                <div className="h-3 bg-maroon-100/70 rounded w-3/4" />
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="h-3 bg-maroon-100/60 rounded w-24" />
                  <div className="h-10 bg-maroon-100/40 border border-maroon-200/60 rounded-md w-full" />
                </div>

                <div className="space-y-2">
                  <div className="h-3 bg-maroon-100/60 rounded w-28" />
                  <div className="h-10 bg-maroon-100/40 border border-maroon-200/60 rounded-md w-full" />
                </div>

                <div className="space-y-2">
                  <div className="h-3 bg-maroon-100/60 rounded w-24" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-12 bg-maroon-100/50 border border-maroon-200/60 rounded-xl" />
                    <div className="h-12 bg-maroon-100/50 border border-maroon-200/60 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-3 bg-maroon-100/60 rounded w-32" />
                  <div className="h-20 bg-maroon-100/40 border border-maroon-200/60 rounded-md w-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-maroon-100 p-6 sm:p-8 space-y-6">
              <div className="border-b border-maroon-100 pb-4 space-y-1">
                <div className="h-6 bg-maroon-200/70 rounded w-1/3" />
                <div className="h-3 bg-maroon-100/60 rounded w-1/4" />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-maroon-100/40 rounded-xl border border-maroon-100 flex items-center justify-between"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-maroon-200/60 rounded w-3/4" />
                      <div className="h-3 bg-maroon-100/60 rounded w-1/2" />
                    </div>
                    <div className="w-16 h-7 bg-maroon-200/50 rounded-md" />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-maroon-100 space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 bg-maroon-100/60 rounded w-16" />
                  <div className="h-3 bg-maroon-200/60 rounded w-14" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-maroon-100/60 rounded w-24" />
                  <div className="h-3 bg-maroon-200/60 rounded w-12" />
                </div>
                <div className="pt-3 border-t border-maroon-100 flex justify-between">
                  <div className="h-5 bg-maroon-200/70 rounded w-24" />
                  <div className="h-6 bg-maroon-200/80 rounded w-20" />
                </div>
              </div>

              <div className="h-14 bg-maroon-900/30 rounded-md" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
