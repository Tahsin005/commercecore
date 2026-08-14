import { Tag } from "lucide-react";

export function CategoriesSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex items-center space-x-2 text-xs font-semibold text-maroon-800 uppercase tracking-wider mb-2">
        <Tag className="w-3.5 h-3.5" />
        <span>Browse Categories</span>
      </div>
      <div className="flex flex-wrap gap-2 pb-2">
        <div className="w-28 h-8 bg-maroon-100/70 border border-maroon-200/60 rounded-full" />
        <div className="w-32 h-8 bg-maroon-100/70 border border-maroon-200/60 rounded-full" />
        <div className="w-24 h-8 bg-maroon-100/70 border border-maroon-200/60 rounded-full" />
        <div className="w-36 h-8 bg-maroon-100/70 border border-maroon-200/60 rounded-full" />
      </div>
    </div>
  );
}
