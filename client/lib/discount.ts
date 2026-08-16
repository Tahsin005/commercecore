import { SiteDiscountSetting } from "@/hooks/useSettingsQueries";

export function isDiscountActive(discountSetting?: SiteDiscountSetting | null): boolean {
  if (!discountSetting || !discountSetting.isActive || !discountSetting.discountPercentage || discountSetting.discountPercentage <= 0) {
    return false;
  }

  const now = new Date();

  if (discountSetting.startDate) {
    const start = new Date(discountSetting.startDate);
    if (!isNaN(start.getTime()) && now < start) {
      return false;
    }
  }

  if (discountSetting.endDate) {
    const end = new Date(discountSetting.endDate);
    if (!isNaN(end.getTime()) && now > end) {
      return false;
    }
  }

  return true;
}

export function getDiscountedPrice(price: number, discountSetting?: SiteDiscountSetting | null): number {
  if (!isDiscountActive(discountSetting)) {
    return price;
  }

  const percentage = discountSetting?.discountPercentage || 0;
  const discounted = price - (price * percentage) / 100;
  return Math.max(0, Math.round(discounted));
}

export function getDiscountAmount(subtotal: number, discountSetting?: SiteDiscountSetting | null): number {
  if (!isDiscountActive(discountSetting)) {
    return 0;
  }

  const percentage = discountSetting?.discountPercentage || 0;
  return Math.max(0, Math.round((subtotal * percentage) / 100));
}
