"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Truck, Percent, Megaphone, Globe, Save } from "lucide-react";
import { useSiteSettingsQuery, useUpdateSettingMutation } from "@/hooks/useSettingsQueries";
import {
  deliveryChargeSchema,
  siteDiscountSchema,
  marqueeSchema,
  footerSettingsSchema,
  DeliveryChargeInput,
  SiteDiscountInput,
  MarqueeInput,
  FooterSettingsInput,
} from "@/lib/validations/settings";

export function SiteSettingsTab() {
  const { data: settings, isLoading } = useSiteSettingsQuery();
  const updateSettingMutation = useUpdateSettingMutation();

  // delivery charges form 
  const {
    register: regDelivery,
    handleSubmit: handleDeliverySubmit,
    reset: resetDelivery,
    formState: { errors: deliveryErrors },
  } = useForm<DeliveryChargeInput>({
    resolver: zodResolver(deliveryChargeSchema),
    defaultValues: { insideDhaka: 60, outsideDhaka: 120 },
  });

  //  discount form 
  const {
    register: regDiscount,
    handleSubmit: handleDiscountSubmit,
    reset: resetDiscount,
    formState: { errors: discountErrors },
  } = useForm<SiteDiscountInput>({
    resolver: zodResolver(siteDiscountSchema),
    defaultValues: { discountPercentage: 0, isActive: false },
  });

  //  marquee form 
  const {
    register: regMarquee,
    handleSubmit: handleMarqueeSubmit,
    reset: resetMarquee,
    formState: { errors: marqueeErrors },
  } = useForm<MarqueeInput>({
    resolver: zodResolver(marqueeSchema),
    defaultValues: { text: "", isActive: true },
  });

  // footer settings form 
  const {
    register: regFooter,
    handleSubmit: handleFooterSubmit,
    reset: resetFooter,
    formState: { errors: footerErrors },
  } = useForm<FooterSettingsInput>({
    resolver: zodResolver(footerSettingsSchema),
    defaultValues: { description: "", helpline: "" },
  });

  useEffect(() => {
    if (settings) {
      if (settings.delivery_charge) {
        resetDelivery({
          insideDhaka: settings.delivery_charge.insideDhaka ?? 60,
          outsideDhaka: settings.delivery_charge.outsideDhaka ?? 120,
        });
      }
      if (settings.site_discount) {
        resetDiscount({
          discountPercentage: settings.site_discount.discountPercentage ?? 0,
          isActive: settings.site_discount.isActive ?? false,
        });
      }
      if (settings.marquee) {
        resetMarquee({
          text: settings.marquee.text ?? "",
          isActive: settings.marquee.isActive ?? true,
        });
      }
      if (settings.footer_settings) {
        resetFooter({
          description: settings.footer_settings.description ?? "",
          helpline: settings.footer_settings.helpline ?? "",
        });
      }
    }
  }, [settings, resetDelivery, resetDiscount, resetMarquee, resetFooter]);

  const onSaveDeliveryCharge = (data: DeliveryChargeInput) => {
    updateSettingMutation.mutate(
      { key: "delivery_charge", value: data },
      { onSuccess: () => toast.success("Delivery charges updated successfully!") }
    );
  };

  const onSaveDiscount = (data: SiteDiscountInput) => {
    updateSettingMutation.mutate(
      { key: "site_discount", value: data },
      { onSuccess: () => toast.success("Sitewide discount updated successfully!") }
    );
  };

  const onSaveMarquee = (data: MarqueeInput) => {
    updateSettingMutation.mutate(
      { key: "marquee", value: { text: data.text.trim(), isActive: data.isActive } },
      { onSuccess: () => toast.success("Announcement marquee updated successfully!") }
    );
  };

  const onSaveFooter = (data: FooterSettingsInput) => {
    const existingLinks = settings?.footer_settings?.socialLinks || [];
    updateSettingMutation.mutate(
      { key: "footer_settings", value: { description: data.description?.trim() || "", helpline: data.helpline?.trim() || "", socialLinks: existingLinks } },
      { onSuccess: () => toast.success("Footer settings updated successfully!") }
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-maroon-100 pb-3">
              <div className="w-5 h-5 bg-maroon-200/70 rounded-full" />
              <div className="h-5 w-40 bg-maroon-200/70 rounded-md" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="h-3 w-24 bg-maroon-100 rounded mb-1.5" />
                <div className="h-9 w-full bg-maroon-100/60 rounded-lg" />
              </div>
              <div>
                <div className="h-3 w-28 bg-maroon-100 rounded mb-1.5" />
                <div className="h-9 w-full bg-maroon-100/60 rounded-lg" />
              </div>
            </div>
            <div className="h-10 w-full bg-maroon-200/60 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form onSubmit={handleDeliverySubmit(onSaveDeliveryCharge)} className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-maroon-100 pb-3">
          <Truck className="w-5 h-5 text-maroon-800" />
          <h3 className="font-serif font-bold text-lg text-maroon-900">Delivery Charges (BDT)</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Inside Dhaka (৳)</label>
            <input
              type="number"
              {...regDelivery("insideDhaka", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-maroon-700"
            />
            {deliveryErrors.insideDhaka && <p className="text-red-500 text-[11px] mt-1">{deliveryErrors.insideDhaka.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Outside Dhaka (৳)</label>
            <input
              type="number"
              {...regDelivery("outsideDhaka", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-maroon-700"
            />
            {deliveryErrors.outsideDhaka && <p className="text-red-500 text-[11px] mt-1">{deliveryErrors.outsideDhaka.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={updateSettingMutation.isPending}
          className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5 text-cream" />
          <span>Save Delivery Charges</span>
        </button>
      </form>

      <form onSubmit={handleDiscountSubmit(onSaveDiscount)} className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-maroon-100 pb-3">
          <Percent className="w-5 h-5 text-maroon-800" />
          <h3 className="font-serif font-bold text-lg text-maroon-900">Sitewide Discount</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Discount Percentage (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              {...regDiscount("discountPercentage", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-maroon-700"
            />
            {discountErrors.discountPercentage && <p className="text-red-500 text-[11px] mt-1">{discountErrors.discountPercentage.message}</p>}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="discountActive"
              {...regDiscount("isActive")}
              className="w-4 h-4 text-maroon-800 rounded border-maroon-300 focus:ring-maroon-700 cursor-pointer"
            />
            <label htmlFor="discountActive" className="text-xs font-semibold text-maroon-900 cursor-pointer">
              Activate Sitewide Discount Banner &amp; Rates
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateSettingMutation.isPending}
          className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5 text-cream" />
          <span>Save Discount Settings</span>
        </button>
      </form>

      <form onSubmit={handleMarqueeSubmit(onSaveMarquee)} className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-maroon-100 pb-3">
          <Megaphone className="w-5 h-5 text-maroon-800" />
          <h3 className="font-serif font-bold text-lg text-maroon-900">Header Announcement Marquee</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Marquee Ticker Text</label>
            <input
              type="text"
              {...regMarquee("text")}
              placeholder="e.g. Free shipping on orders over ৳2000!"
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-maroon-700"
            />
            {marqueeErrors.text && <p className="text-red-500 text-[11px] mt-1">{marqueeErrors.text.message}</p>}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="marqueeActive"
              {...regMarquee("isActive")}
              className="w-4 h-4 text-maroon-800 rounded border-maroon-300 focus:ring-maroon-700 cursor-pointer"
            />
            <label htmlFor="marqueeActive" className="text-xs font-semibold text-maroon-900 cursor-pointer">
              Show Marquee Ticker on Store Header
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateSettingMutation.isPending}
          className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5 text-cream" />
          <span>Save Marquee</span>
        </button>
      </form>

      <form onSubmit={handleFooterSubmit(onSaveFooter)} className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-maroon-100 pb-3">
          <Globe className="w-5 h-5 text-maroon-800" />
          <h3 className="font-serif font-bold text-lg text-maroon-900">Footer &amp; Support Info</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Brand Description</label>
            <textarea
              rows={2}
              {...regFooter("description")}
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-maroon-700 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Support Helpline Phone</label>
            <input
              type="text"
              {...regFooter("helpline")}
              placeholder="01700000000"
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-maroon-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updateSettingMutation.isPending}
          className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5 text-cream" />
          <span>Save Footer Info</span>
        </button>
      </form>
    </div>
  );
}
