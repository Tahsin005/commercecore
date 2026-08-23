"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

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

  const imageList = images && images.length > 0 ? images : [];
  const hasMultipleImages = imageList.length > 1;

  // Automatically cycle through images every 3 seconds
  useEffect(() => {
    if (!hasMultipleImages) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultipleImages, imageList.length]);

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
                  idx === currentIndex
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
                  priority={idx === 0}
                />
              </div>
            ))}

            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-20 pointer-events-none">
              {imageList.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentIndex
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
