"use client";

import React, { useId } from "react";

interface RatingStarsProps {
  rating: number;
  sizeClass?: string;
}

export function RatingStars({ rating, sizeClass = "w-4 h-4" }: RatingStarsProps) {
  const baseId = useId();

  return (
    <div
      className="flex items-center space-x-0.5"
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillPercentage = Math.max(0, Math.min(100, (rating - (starIndex - 1)) * 100));
        const gradientId = `${baseId}-star-grad-${starIndex}`;

        return (
          <div key={starIndex} className="relative inline-flex items-center justify-center">
            <svg
              className={sizeClass}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset={`${fillPercentage}%`} stopColor="#F59E0B" />
                  <stop offset={`${fillPercentage}%`} stopColor="#E2E8F0" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#${gradientId})`}
                stroke={fillPercentage > 0 ? "#D97706" : "#CBD5E1"}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
