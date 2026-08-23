"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";

interface ProductImageReorderGridProps {
  images: string[];
  onReorder: (newImages: string[]) => void;
  onRemove: (index: number) => void;
}

export function ProductImageReorderGrid({
  images,
  onReorder,
  onRemove,
}: ProductImageReorderGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Set format for cross-browser support
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    // Only reset if leaving the current target element
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...images];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    onReorder(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Quick action buttons for touch & keyboard accessibility
  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const [item] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, item);
    onReorder(updated);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [item] = updated.splice(index, 1);
    updated.unshift(item);
    onReorder(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-maroon-700">
        <span className="flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 text-maroon-500" />
          <span>Drag images to rearrange order ({images.length} uploaded)</span>
        </span>
        <span className="text-[10px] text-maroon-500 font-mono">
          First image (#1) is Cover
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {images.map((imgUrl, idx) => {
          const isCover = idx === 0;
          const isBeingDragged = draggedIndex === idx;
          const isDropTarget = dragOverIndex === idx;

          return (
            <div
              key={`${imgUrl}-${idx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragOver={handleDragOver}
              onDragLeave={(e) => handleDragLeave(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`group relative rounded-xl overflow-hidden border bg-white shadow-xs transition-all duration-200 select-none cursor-grab active:cursor-grabbing ${
                isBeingDragged
                  ? "opacity-35 scale-95 border-dashed border-maroon-500 ring-2 ring-maroon-300"
                  : isDropTarget
                  ? "border-maroon-700 ring-2 ring-maroon-600 scale-[1.03] shadow-md bg-maroon-50/60"
                  : isCover
                  ? "border-emerald-500 ring-1 ring-emerald-400 hover:shadow-md"
                  : "border-maroon-200 hover:border-maroon-400 hover:shadow-md"
              }`}
            >
              <div className="relative w-full aspect-square overflow-hidden bg-off-white">
                <Image
                  src={imgUrl}
                  alt={`Product image ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover pointer-events-none transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-xs text-white p-1.5 rounded-full shadow-md">
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>

                <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                  <span
                    className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md shadow-xs ${
                      isCover
                        ? "bg-emerald-600 text-white"
                        : "bg-black/65 backdrop-blur-xs text-white"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(idx);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-500 focus-visible:outline-none shadow-md hover:scale-110 z-10"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {isCover ? (
                  <div className="absolute bottom-0 inset-x-0 bg-emerald-600/95 text-white text-[9px] font-bold text-center py-0.5 uppercase tracking-wider shadow-xs flex items-center justify-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Cover Photo</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMakeCover(idx);
                    }}
                    className="absolute bottom-0 inset-x-0 bg-maroon-900/90 hover:bg-maroon-900 text-white text-[9px] font-semibold text-center py-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-maroon-500 focus-visible:outline-none transition-all cursor-pointer shadow-xs z-10"
                  >
                    Set as Cover
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between p-1 bg-off-white border-t border-maroon-100 text-[10px] text-maroon-700">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(idx, "left");
                  }}
                  className="p-1 hover:bg-maroon-200/70 rounded text-maroon-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Move left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[9px] font-medium text-maroon-500 font-sans">
                  {isCover ? "Main" : `Slot ${idx + 1}`}
                </span>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(idx, "right");
                  }}
                  className="p-1 hover:bg-maroon-200/70 rounded text-maroon-800 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Move right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
