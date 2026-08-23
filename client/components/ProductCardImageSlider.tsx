"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Pause, Play } from "lucide-react";

interface ProductCardImageSliderProps {
  images?: string[];
  productName: string;
  productHref: string;
  className?: string;
}

export function ProductCardImageSlider({
  images,
  productName,
  productHref,
  className = "bg-off-white p-2 relative flex items-center justify-center border-b border-maroon-100/60 aspect-square sm:h-72 overflow-hidden rounded-t-xl",
}: ProductCardImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const imageList = images && images.length > 0 ? images : [];
  const hasMultipleImages = imageList.length > 1;

  // Normalized active index to guarantee in-bounds rendering even if image collection shrinks
  const activeIndex = hasMultipleImages ? currentIndex % imageList.length : 0;

  // Honor prefers-reduced-motion and user pause state
  useEffect(() => {
    if (!hasMultipleImages || isPaused) return;

    const mediaQuery = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (mediaQuery && mediaQuery.matches) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultipleImages, isPaused, imageList.length]);

  return (
    <div className={className}>
      <Link
        href={productHref}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={productName}
      >
        {imageList.length === 0 ? (
          <Package className="w-16 h-16 text-maroon-300 group-hover:scale-110 transition-transform duration-300" />
        ) : !hasMultipleImages ? (
          <Image
            src={imageList[0]}
            alt={productName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <>
            {imageList.map((imgUrl, idx) => (
              <div
                key={`${imgUrl}-${idx}`}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
                  idx === activeIndex
                    ? "opacity-100 z-10 pointer-events-auto"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${productName} image ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}

            {/* Accessible Slideshow Pause/Play Control */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsPaused((prev) => !prev);
              }}
              className={`absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-all z-20 cursor-pointer shadow-xs focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
                isPaused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              title={isPaused ? "Play slideshow" : "Pause slideshow"}
              aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            </button>

            {/* Subtle bottom indicator dots */}
            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-20 pointer-events-none">
              {imageList.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === activeIndex
                      ? "w-4 bg-maroon-800 shadow-xs"
                      : "w-1.5 bg-maroon-300/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </Link>
    </div>
  );
}
