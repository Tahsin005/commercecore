"use client";

import { useState, useEffect, useRef } from "react";
import * as Slider from "@radix-ui/react-slider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface PriceRangeSliderProps {
  minBound?: number;
  maxBound?: number;
  minPrice: string;
  maxPrice: string;
  onChange: (min: string, max: string) => void;
  className?: string;
  showPresets?: boolean;
}

export function PriceRangeSlider({
  minBound = 10,
  maxBound = 99999,
  minPrice,
  maxPrice,
  onChange,
  className = "",
  showPresets = true,
}: PriceRangeSliderProps) {
  const { language } = useLanguage();

  const effectiveMin = Math.max(10, minBound);
  const effectiveMax = maxBound > effectiveMin ? maxBound : 99999;
  const step = 50; // clean 50 BDT step

  const getInitialValues = (): [number, number] => {
    const minVal = minPrice !== "" ? Number(minPrice) : effectiveMin;
    const maxVal = maxPrice !== "" ? Number(maxPrice) : effectiveMax;
    return [
      Math.max(effectiveMin, isNaN(minVal) ? effectiveMin : minVal),
      Math.min(effectiveMax, isNaN(maxVal) ? effectiveMax : maxVal),
    ];
  };

  const [values, setValues] = useState<[number, number]>(getInitialValues);
  const [minInputVal, setMinInputVal] = useState<string>(minPrice);
  const [maxInputVal, setMaxInputVal] = useState<string>(maxPrice);
  const isDraggingRef = useRef(false);

  // Sync external minPrice / maxPrice changes into local state only when not dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      const parsedMin = minPrice !== "" ? Number(minPrice) : effectiveMin;
      const parsedMax = maxPrice !== "" ? Number(maxPrice) : effectiveMax;
      setValues([
        Math.max(effectiveMin, isNaN(parsedMin) ? effectiveMin : parsedMin),
        Math.min(effectiveMax, isNaN(parsedMax) ? effectiveMax : parsedMax),
      ]);
      setMinInputVal(minPrice);
      setMaxInputVal(maxPrice);
    }
  }, [minPrice, maxPrice, effectiveMin, effectiveMax]);

  // While dragging: update visual feedback instantly without calling parent
  const handleSliderValueChange = (newValues: number[]) => {
    isDraggingRef.current = true;
    if (newValues.length === 2) {
      const [newMin, newMax] = newValues as [number, number];
      setValues([newMin, newMax]);
      setMinInputVal(newMin > effectiveMin ? String(newMin) : "");
      setMaxInputVal(newMax < effectiveMax ? String(newMax) : "");
    }
  };

  // When user releases the slider thumb: commit to parent
  const handleSliderValueCommit = (committedValues: number[]) => {
    isDraggingRef.current = false;
    if (committedValues.length === 2) {
      const [cMin, cMax] = committedValues as [number, number];
      const outMin = cMin > effectiveMin ? String(cMin) : "";
      const outMax = cMax < effectiveMax ? String(cMax) : "";
      onChange(outMin, outMax);
    }
  };

  // Direct manual input handlers
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setMinInputVal(raw);
    if (raw === "") {
      setValues((prev) => [effectiveMin, prev[1]]);
      return;
    }
    const num = Number(raw);
    if (!isNaN(num)) {
      setValues((prev) => [Math.min(num, prev[1]), prev[1]]);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setMaxInputVal(raw);
    if (raw === "") {
      setValues((prev) => [prev[0], effectiveMax]);
      return;
    }
    const num = Number(raw);
    if (!isNaN(num)) {
      setValues((prev) => [prev[0], Math.max(num, prev[0])]);
    }
  };

  const commitManualInputs = () => {
    const minNum = minInputVal !== "" ? Number(minInputVal) : null;
    const maxNum = maxInputVal !== "" ? Number(maxInputVal) : null;

    let finalMin = minNum !== null && !isNaN(minNum) ? Math.max(effectiveMin, minNum) : effectiveMin;
    let finalMax = maxNum !== null && !isNaN(maxNum) ? Math.min(effectiveMax, maxNum) : effectiveMax;

    if (finalMin > finalMax) {
      finalMin = finalMax;
    }

    setValues([finalMin, finalMax]);
    setMinInputVal(finalMin > effectiveMin ? String(finalMin) : "");
    setMaxInputVal(finalMax < effectiveMax ? String(finalMax) : "");

    onChange(
      finalMin > effectiveMin ? String(finalMin) : "",
      finalMax < effectiveMax ? String(finalMax) : ""
    );
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitManualInputs();
      (e.target as HTMLInputElement).blur();
    }
  };

  // Preset button click
  const handlePresetClick = (pMin: number | null, pMax: number | null) => {
    const nextMin = pMin !== null ? pMin : effectiveMin;
    const nextMax = pMax !== null ? pMax : effectiveMax;
    setValues([nextMin, nextMax]);
    setMinInputVal(pMin !== null ? String(pMin) : "");
    setMaxInputVal(pMax !== null ? String(pMax) : "");
    onChange(pMin !== null ? String(pMin) : "", pMax !== null ? String(pMax) : "");
  };

  const isFiltered = minPrice !== "" || maxPrice !== "";

  return (
    <div className={`space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-maroon-50 border border-maroon-200/80 px-2.5 py-1 rounded-lg">
          <span className="text-[10px] font-bold text-maroon-700">৳</span>
          <span className="text-xs font-mono font-bold text-maroon-900">{values[0].toLocaleString()}</span>
        </div>

        <span className="text-maroon-300 font-bold text-xs">—</span>

        <div className="flex items-center space-x-1 bg-maroon-50 border border-maroon-200/80 px-2.5 py-1 rounded-lg">
          <span className="text-[10px] font-bold text-maroon-700">৳</span>
          <span className="text-xs font-mono font-bold text-maroon-900">{values[1].toLocaleString()}</span>
        </div>
      </div>

      <div className="pt-2 pb-1 px-1">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
          value={[values[0], values[1]]}
          min={effectiveMin}
          max={effectiveMax}
          step={step}
          minStepsBetweenThumbs={1}
          onValueChange={handleSliderValueChange}
          onValueCommit={handleSliderValueCommit}
        >
          <Slider.Track className="bg-maroon-100 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-gradient-to-r from-maroon-900 to-maroon-700 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-maroon-900 rounded-full shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-maroon-800/40 cursor-grab active:cursor-grabbing"
            aria-label="Min price"
          />
          <Slider.Thumb
            className="block w-5 h-5 bg-white border-2 border-maroon-900 rounded-full shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-maroon-800/40 cursor-grab active:cursor-grabbing"
            aria-label="Max price"
          />
        </Slider.Root>
      </div>

      <div className="flex items-center space-x-2 pt-0.5">
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-maroon-400">৳</span>
          <input
            type="number"
            value={minInputVal}
            onChange={handleMinInputChange}
            onBlur={commitManualInputs}
            onKeyDown={handleInputKeyDown}
            placeholder={String(effectiveMin)}
            className="w-full pl-6 pr-2 py-1.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-maroon-700 shadow-2xs"
          />
        </div>
        <span className="text-maroon-300 font-bold text-xs">-</span>
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-maroon-400">৳</span>
          <input
            type="number"
            value={maxInputVal}
            onChange={handleMaxInputChange}
            onBlur={commitManualInputs}
            onKeyDown={handleInputKeyDown}
            placeholder={String(effectiveMax)}
            className="w-full pl-6 pr-2 py-1.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-maroon-700 shadow-2xs"
          />
        </div>
      </div>

      {showPresets && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handlePresetClick(null, null)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              !isFiltered
                ? "bg-maroon-900 text-cream shadow-2xs"
                : "bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200/80"
            }`}
          >
            {language === "bn" ? "সকল" : "All"}
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick(null, 1000)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              minPrice === "" && maxPrice === "1000"
                ? "bg-maroon-900 text-cream shadow-2xs"
                : "bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200/80"
            }`}
          >
            &lt; ৳1,000
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick(1000, 5000)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              minPrice === "1000" && maxPrice === "5000"
                ? "bg-maroon-900 text-cream shadow-2xs"
                : "bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200/80"
            }`}
          >
            ৳1K - ৳5K
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick(5000, 15000)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              minPrice === "5000" && maxPrice === "15000"
                ? "bg-maroon-900 text-cream shadow-2xs"
                : "bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200/80"
            }`}
          >
            ৳5K - ৳15K
          </button>
          <button
            type="button"
            onClick={() => handlePresetClick(15000, null)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              minPrice === "15000" && maxPrice === ""
                ? "bg-maroon-900 text-cream shadow-2xs"
                : "bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200/80"
            }`}
          >
            ৳15K+
          </button>
        </div>
      )}
    </div>
  );
}
