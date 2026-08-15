export function CategoriesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-36 bg-maroon-100/80 rounded-md" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-maroon-100 p-2.5 space-y-3 shadow-xs"
          >
            <div className="w-full aspect-square bg-maroon-100/60 rounded-xl" />
            <div className="h-4 w-3/4 bg-maroon-100/80 rounded-md mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
