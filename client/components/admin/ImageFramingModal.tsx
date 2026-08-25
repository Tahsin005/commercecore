"use client";

import React, { useState, useCallback, useEffect } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import {
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Crop,
  Layers,
  Loader2,
  Maximize2,
} from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";
import toast from "react-hot-toast";

export interface ImageCropItem {
  file?: File;
  url: string;
  name: string;
}

interface ImageFramingModalProps {
  isOpen: boolean;
  items: ImageCropItem[];
  onComplete: (croppedFiles: File[]) => void;
  onCancel: () => void;
  defaultAspect?: number; // 4/5 = 0.8
  targetWidth?: number; // 1122
  targetHeight?: number; // 1402
}

export function ImageFramingModal({
  isOpen,
  items,
  onComplete,
  onCancel,
  defaultAspect = 4 / 5,
  targetWidth = 1122,
  targetHeight = 1402,
}: ImageFramingModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const aspect = defaultAspect; // Use caller-provided or standard 4:5 aspect ratio
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedResults, setCroppedResults] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset when opened with new items
  useEffect(() => {
    if (isOpen && items.length > 0) {
      setCurrentIndex(0);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      setCroppedResults([]);
      setIsProcessing(false);
    }
  }, [isOpen, items]);

  const currentItem = items[currentIndex];

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 1));
  };

  const processCurrentCrop = async (): Promise<File | null> => {
    if (!currentItem || !croppedAreaPixels) return null;

    const file = await getCroppedImg(
      currentItem.url,
      croppedAreaPixels,
      rotation,
      targetWidth,
      targetHeight,
      currentItem.name || `framed-product-${Date.now()}.jpg`,
      "image/jpeg",
      0.92
    );
    return file;
  };

  const handleConfirmCurrent = async () => {
    if (!currentItem || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedFile = await processCurrentCrop();
      if (!croppedFile) {
        throw new Error("Failed to generate cropped image");
      }

      const nextResults = [...croppedResults, croppedFile];
      setCroppedResults(nextResults);

      if (currentIndex + 1 < items.length) {
        // Move to next image
        setCurrentIndex((prev) => prev + 1);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
      } else {
        // All images cropped
        onComplete(nextResults);
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || "Failed to crop image";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipCurrent = () => {
    if (!currentItem || !currentItem.file) return;

    const nextResults = [...croppedResults, currentItem.file];
    setCroppedResults(nextResults);

    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
    } else {
      onComplete(nextResults);
    }
  };

  if (!isOpen || !currentItem) return null;

  const totalItems = items.length;
  const isLast = currentIndex === totalItems - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-4 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-maroon-900/60 text-maroon-300 border border-maroon-700/50 flex items-center justify-center">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-serif font-bold text-white tracking-tight">
                  Frame Product Image
                </h3>
                {totalItems > 1 && (
                  <span className="bg-neutral-800 text-neutral-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full border border-neutral-700">
                    {currentIndex + 1} of {totalItems}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                Standard dimension: <span className="font-mono text-cream font-semibold">{targetWidth} × {targetHeight} px (4:5)</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-[52vh] sm:h-[58vh] bg-black select-none">
          <Cropper
            image={currentItem.url}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
            style={{
              containerStyle: { backgroundColor: "#0a0a0a" },
              cropAreaStyle: {
                border: "2px solid #e5b299",
                boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.65)",
              },
            }}
          />

          <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-700/80 shadow-lg text-cream">
            <Sparkles className="w-3.5 h-3.5 text-maroon-400" />
            <span className="text-[11px] font-bold">Standard 4:5 ({targetWidth} × {targetHeight} px)</span>
          </div>

          {totalItems > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-1.5 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700">
              {items.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-cream scale-125 ring-2 ring-maroon-500"
                      : idx < currentIndex
                      ? "bg-emerald-500"
                      : "bg-neutral-600"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 bg-neutral-950 border-t border-neutral-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1 min-w-[200px] max-w-sm">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-maroon-500"
              />
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold text-neutral-400 w-10 text-right shrink-0">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5 text-maroon-400" />
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setRotation(0);
                }}
                className="px-2.5 py-1.5 text-neutral-400 hover:text-neutral-200 text-xs font-semibold transition-colors cursor-pointer underline"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
            {currentItem.file ? (
              <button
                type="button"
                onClick={handleSkipCurrent}
                disabled={isProcessing}
                className="px-4 py-2 text-neutral-400 hover:text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Skip Cropping (Use Original)
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmCurrent}
                disabled={isProcessing}
                className="px-5 py-2 bg-gradient-to-r from-maroon-900 to-maroon-800 hover:from-maroon-800 hover:to-maroon-700 text-cream text-xs font-bold rounded-xl shadow-lg border border-maroon-600/50 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cream" />
                    <span>Framing Image...</span>
                  </>
                ) : isLast ? (
                  <>
                    <Check className="w-4 h-4 text-cream" />
                    <span>Confirm & Upload {totalItems > 1 ? `(${totalItems})` : ""}</span>
                  </>
                ) : (
                  <>
                    <span>Next Image ({currentIndex + 1}/{totalItems})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
