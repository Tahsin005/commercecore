"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Package, Maximize2 } from "lucide-react";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), {
  ssr: false,
});

interface ProductImageGalleryProps {
  images: string[];
  colors?: string[];
  selectedColor?: string | null;
  productName: string;
  isOnSale: boolean;
  discountPercent: number;
  offLabel?: string;
  hoverToZoomLabel?: string;
  selectedImageIndex: number;
  onSelectImageIndex: (index: number) => void;
}

export function ProductImageGallery({
  images,
  colors,
  selectedColor,
  productName,
  isOnSale,
  discountPercent,
  offLabel = "OFF",
  hoverToZoomLabel = "Touch or click to zoom",
  selectedImageIndex,
  onSelectImageIndex,
}: ProductImageGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgWrapperRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);

  const currentImage = images.length > 0 ? images[selectedImageIndex] || images[0] : null;
  const slides = images.map((src) => ({ src }));

  // Direct DOM transformOrigin updates without triggering React component re-renders
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imgWrapperRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (imgWrapperRef.current) {
        imgWrapperRef.current.style.transformOrigin = `${x}% ${y}%`;
      }
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHoverZooming(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHoverZooming(false);
    if (imgWrapperRef.current) {
      imgWrapperRef.current.style.transformOrigin = "50% 50%";
    }
  }, []);

  const handleOpenLightbox = () => {
    setIsHoverZooming(false);
    setIsLightboxOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-start w-full">
      <div className="relative w-full">
        {isOnSale && (
          <span className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-mono text-xs font-black tracking-wider px-2.5 py-1 rounded-md shadow-md border-2 border-white uppercase z-20 pointer-events-none">
            {discountPercent}% {offLabel}
          </span>
        )}

        <div
          ref={containerRef}
          role="button"
          tabIndex={0}
          aria-label={`View ${productName} image in full-screen gallery`}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleOpenLightbox}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOpenLightbox();
            }
          }}
          className="relative w-full aspect-[4/5] max-w-[480px] mx-auto rounded-2xl overflow-hidden flex items-center justify-center bg-off-white border border-maroon-100/80 shadow-xs cursor-zoom-in group select-none focus-visible:ring-2 focus-visible:ring-maroon-700 focus-visible:outline-none"
          title="Click or tap to view full screen with pinch zoom"
        >
          {currentImage ? (
            <div
              ref={imgWrapperRef}
              className={`relative w-full h-full overflow-hidden flex items-center justify-center will-change-transform ${
                isHoverZooming ? "scale-225" : "scale-100"
              }`}
              style={{
                transition: "transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)",
                transformOrigin: "50% 50%",
              }}
            >
              <Image
                src={currentImage}
                alt={productName}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <Package className="w-32 h-32 text-maroon-300" />
          )}

          {currentImage && (
            <div className="absolute bottom-3 right-3 bg-maroon-900/85 text-cream text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center space-x-1.5 transition-opacity duration-200 pointer-events-none group-hover:bg-maroon-900">
              <Maximize2 className="w-3 h-3 text-cream shrink-0" />
              <span>{hoverToZoomLabel}</span>
            </div>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2.5 mt-4 pt-3 border-t border-maroon-100/80 w-full overflow-x-auto overflow-y-hidden py-1 scrollbar-none">
          {images.map((imgUrl, idx) => {
            const isSelected = selectedImageIndex === idx;
            const imgColor = colors && colors[idx];
            const isMatchingColor = !selectedColor || (imgColor && imgColor.toLowerCase() === selectedColor.toLowerCase());

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectImageIndex(idx)}
                className={`relative w-14 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "border-maroon-900 ring-2 ring-maroon-700/40 scale-105 opacity-100"
                    : isMatchingColor
                    ? "border-maroon-200 hover:border-maroon-500 opacity-90 hover:opacity-100"
                    : "border-maroon-100 opacity-40 hover:opacity-80"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
                {imgColor && (
                  <span
                    className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white shadow-xs z-10"
                    style={{ backgroundColor: imgColor }}
                    title={`Color: ${imgColor}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {slides.length > 0 && (
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          index={selectedImageIndex}
          slides={slides}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 4,
            scrollToZoom: true,
          }}
          on={{
            view: ({ index }) => onSelectImageIndex(index),
          }}
        />
      )}
    </div>
  );
}
