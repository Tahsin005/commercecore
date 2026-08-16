"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePublicBannersQuery } from "@/hooks/useCmsQueries";

export function HomepageBanners() {
  const { data: banners = [], isLoading } = usePublicBannersQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners.filter((b) => b.isActive);

  useEffect(() => {
    if (activeBanners.length === 0) {
      if (currentIndex !== 0) setCurrentIndex(0);
      return;
    }

    if (currentIndex >= activeBanners.length) {
      setCurrentIndex(0);
    }

    if (activeBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length, currentIndex]);

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-maroon-100 bg-maroon-50/50 aspect-21/9 min-h-[180px] sm:min-h-[280px] md:min-h-[360px] animate-pulse my-2" />
    );
  }

  // Fallback to default public banner image if no active CMS banners exist
  if (activeBanners.length === 0) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-maroon-100 bg-black/5 aspect-21/9 min-h-[180px] sm:min-h-[280px] md:min-h-[360px] my-2">
        <Image
          src="/banner.png"
          alt="CommerceCore Collection Banner"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-maroon-100 bg-black/5 group aspect-21/9 min-h-[180px] sm:min-h-[280px] md:min-h-[360px] my-2">
      {activeBanners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={banner.imageUrl}
            alt={banner.title || "Homepage Banner"}
            fill
            sizes="100vw"
            priority={idx === 0}
            className="object-cover"
          />

          {banner.title && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6 sm:p-8">
              <h2 className="font-serif font-bold text-lg sm:text-2xl md:text-3xl text-white drop-shadow-md max-w-xl">
                {banner.title}
              </h2>
            </div>
          )}
        </div>
      ))}

      {activeBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? "w-6 bg-amber-400" : "w-2 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
