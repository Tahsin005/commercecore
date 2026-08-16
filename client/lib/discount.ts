import { useState, useEffect } from "react";
import { SiteDiscountSetting } from "@/hooks/useSettingsQueries";

export function isDiscountActive(discountSetting?: SiteDiscountSetting | null): boolean {
  if (!discountSetting || !discountSetting.isActive || !discountSetting.discountPercentage || discountSetting.discountPercentage <= 0) {
    return false;
  }

  const now = new Date();

  if (discountSetting.startDate) {
    const start = new Date(discountSetting.startDate);
    if (isNaN(start.getTime()) || now < start) {
      return false;
    }
  }

  if (discountSetting.endDate) {
    const end = new Date(discountSetting.endDate);
    if (isNaN(end.getTime()) || now > end) {
      return false;
    }
  }

  return true;
}

export function useActiveDiscount(discountSetting?: SiteDiscountSetting | null): boolean {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!discountSetting || !discountSetting.isActive) return;

    const now = Date.now();
    const timers: NodeJS.Timeout[] = [];

    if (discountSetting.startDate) {
      const startMs = new Date(discountSetting.startDate).getTime();
      if (!isNaN(startMs) && startMs > now) {
        const delay = startMs - now;
        if (delay < 2147483647) {
          timers.push(setTimeout(() => setTick((t) => t + 1), delay));
        }
      }
    }

    if (discountSetting.endDate) {
      const endMs = new Date(discountSetting.endDate).getTime();
      if (!isNaN(endMs) && endMs > now) {
        const delay = endMs - now;
        if (delay < 2147483647) {
          timers.push(setTimeout(() => setTick((t) => t + 1), delay));
        }
      }
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [discountSetting?.isActive, discountSetting?.startDate, discountSetting?.endDate]);

  return isDiscountActive(discountSetting);
}

export function getDiscountedPrice(price: number, discountSetting?: SiteDiscountSetting | null): number {
  if (!isDiscountActive(discountSetting)) {
    return price;
  }

  const percentage = discountSetting?.discountPercentage || 0;
  const discounted = price - (price * percentage) / 100;
  return Math.max(0, Math.round(discounted * 100) / 100);
}

export function getDiscountAmount(subtotal: number, discountSetting?: SiteDiscountSetting | null): number {
  if (!isDiscountActive(discountSetting)) {
    return 0;
  }

  const percentage = discountSetting?.discountPercentage || 0;
  const rawAmount = (subtotal * percentage) / 100;
  return Math.max(0, Math.round(rawAmount * 100) / 100);
}
