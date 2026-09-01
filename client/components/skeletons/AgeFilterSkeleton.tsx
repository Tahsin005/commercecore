import React from "react";

interface AgeFilterSkeletonProps {
  count?: number;
  layout?: "list" | "grid";
}

export function AgeFilterSkeleton({ count = 7, layout = "list" }: AgeFilterSkeletonProps) {
  const listWidths = ["w-20", "w-24", "w-28", "w-20", "w-24", "w-16", "w-22", "w-20"];
  const gridWidths = ["w-16", "w-20", "w-14", "w-24", "w-18", "w-20"];

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2 animate-pulse" aria-hidden="true">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl border border-maroon-100/70 bg-off-white/60 flex items-center space-x-2"
          >
            <div className="w-2 h-2 rounded-full bg-maroon-200/70 shrink-0" />
            <div
              className={`h-3.5 bg-maroon-100/80 rounded-md ${gridWidths[idx % gridWidths.length]}`}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-maroon-50 animate-pulse" aria-hidden="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="w-full px-3.5 py-2.5 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-maroon-200/70 shrink-0" />
            <div
              className={`h-3.5 bg-maroon-100/80 rounded-md ${listWidths[idx % listWidths.length]}`}
            />
          </div>
          <div className="w-3.5 h-3.5 rounded bg-maroon-100/50 shrink-0" />
        </div>
      ))}
    </div>
  );
}
