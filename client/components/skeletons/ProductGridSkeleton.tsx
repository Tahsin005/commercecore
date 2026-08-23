import { Package } from "lucide-react";

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow-md border border-maroon-100 overflow-hidden flex flex-col justify-between animate-pulse"
        >
          <div className="bg-maroon-100/50 p-6 relative flex items-center justify-center border-b border-maroon-100/60 aspect-square sm:h-72">
            <Package className="w-16 h-16 text-maroon-200/80" />
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 border border-maroon-200/60" />
          </div>

          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-5 bg-maroon-200/60 rounded-md w-3/4" />
              <div className="h-3 bg-maroon-100/80 rounded-md w-full" />
              <div className="h-3 bg-maroon-100/80 rounded-md w-4/5" />
            </div>

            <div className="pt-3 border-t border-maroon-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-3 bg-maroon-100/60 rounded w-10" />
                <div className="h-6 bg-maroon-200/70 rounded w-16" />
              </div>
              <div className="w-24 h-8 bg-maroon-800/20 border border-maroon-200/60 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
