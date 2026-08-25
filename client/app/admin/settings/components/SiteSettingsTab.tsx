"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Truck, Megaphone, Globe, Save, Plus, Trash2, ExternalLink, Share2 } from "lucide-react";
import { useSiteSettingsQuery, useUpdateSettingMutation, SocialLinkItem } from "@/hooks/useSettingsQueries";
import {
  deliveryChargeSchema,
  marqueeSchema,
  footerSettingsSchema,
  DeliveryChargeInput,
  MarqueeInput,
  FooterSettingsInput,
} from "@/lib/validations/settings";
import { PRESELECTED_SOCIAL_ICONS, SocialIcon, getSocialIcon, formatSocialLink } from "@/components/common/SocialIcon";

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

  // marquee form 
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

  // social links state
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [selectedIconId, setSelectedIconId] = useState<string>("facebook");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");

  useEffect(() => {
    if (settings) {
      if (settings.delivery_charge) {
        resetDelivery({
          insideDhaka: settings.delivery_charge.insideDhaka ?? 60,
          outsideDhaka: settings.delivery_charge.outsideDhaka ?? 120,
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
        const currentLinks = (settings.footer_settings.socialLinks || []).map((l: any) => ({
          icon: l.icon || l.platform || "facebook",
          url: l.url || "",
          label: l.label || "",
        }));
        setSocialLinks(currentLinks);
      }
    }
  }, [settings, resetDelivery, resetMarquee, resetFooter]);

  const onSaveDeliveryCharge = (data: DeliveryChargeInput) => {
    updateSettingMutation.mutate(
      { key: "delivery_charge", value: data },
      { onSuccess: () => toast.success("Delivery charges updated successfully!") }
    );
  };

  const onSaveMarquee = (data: MarqueeInput) => {
    updateSettingMutation.mutate(
      { key: "marquee", value: { text: data.text.trim(), isActive: data.isActive } },
      { onSuccess: () => toast.success("Announcement marquee updated successfully!") }
    );
  };

  const onAddSocialLink = () => {
    const trimmedInput = linkUrl.trim();
    if (!trimmedInput) {
      toast.error(selectedIconId === "whatsapp" ? "Please enter a WhatsApp number" : "Please enter a link URL");
      return;
    }

    if (selectedIconId === "whatsapp") {
      const lower = trimmedInput.toLowerCase();
      const isDirectWaUrl = lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("whatsapp://");
      const cleanDigits = trimmedInput.replace(/[^0-9]/g, "");
      if (!isDirectWaUrl && cleanDigits.length < 5) {
        toast.error("Please enter a valid WhatsApp phone number");
        return;
      }
    }

    const iconOption = getSocialIcon(selectedIconId);
    const finalUrl = formatSocialLink(selectedIconId, trimmedInput);

    const newLink: SocialLinkItem = {
      icon: selectedIconId,
      url: finalUrl,
      label: customLabel.trim() || iconOption?.name || selectedIconId,
    };

    setSocialLinks((prev) => [...prev, newLink]);
    setLinkUrl("");
    setCustomLabel("");
    toast.success(`Added ${iconOption?.name || selectedIconId} link`);
  };

  const onRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const onSaveFooter = (data: FooterSettingsInput) => {
    updateSettingMutation.mutate(
      {
        key: "footer_settings",
        value: {
          description: data.description?.trim() || "",
          helpline: data.helpline?.trim() || "",
          socialLinks,
        },
      },
      { onSuccess: () => toast.success("Footer settings & social links updated successfully!") }
    );
  };

  const currentSelectedOption = getSocialIcon(selectedIconId) || PRESELECTED_SOCIAL_ICONS[0];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-maroon-100 pb-3">
              <div className="w-5 h-5 bg-maroon-200/70 rounded-full" />
              <div className="h-5 w-40 bg-maroon-200/70 rounded-md" />
            </div>
            <div className="space-y-3">
              <div className="h-9 bg-maroon-100/50 rounded-lg" />
              <div className="h-9 bg-maroon-100/50 rounded-lg" />
            </div>
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
          <h3 className="font-serif font-bold text-lg text-maroon-900">Delivery Charges</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Inside Dhaka Rate (৳)</label>
            <input
              type="number"
              min={0}
              {...regDelivery("insideDhaka", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-maroon-700"
            />
            {deliveryErrors.insideDhaka && <p className="text-red-500 text-[11px] mt-1">{deliveryErrors.insideDhaka.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Outside Dhaka Rate (৳)</label>
            <input
              type="number"
              min={0}
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

      <form onSubmit={handleFooterSubmit(onSaveFooter)} className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm space-y-5 md:col-span-2">
        <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-maroon-800" />
            <h3 className="font-serif font-bold text-lg text-maroon-900">Footer &amp; Support Info</h3>
          </div>
          <span className="text-[11px] font-semibold text-maroon-700 bg-maroon-50 px-2.5 py-1 rounded-full border border-maroon-200/60">
            {socialLinks.length} {socialLinks.length === 1 ? "link" : "links"} configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Brand Description</label>
            <textarea
              rows={3}
              {...regFooter("description")}
              placeholder="Enter short description about your brand for the footer..."
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-maroon-700 resize-none"
            />
            {footerErrors.description && <p className="text-red-500 text-[11px] mt-1">{footerErrors.description.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Support Helpline Phone</label>
            <input
              type="text"
              {...regFooter("helpline")}
              placeholder="01700000000"
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-maroon-700"
            />
            {footerErrors.helpline && <p className="text-red-500 text-[11px] mt-1">{footerErrors.helpline.message}</p>}
            <p className="text-[11px] text-maroon-600/80 mt-1">
              Displayed with a quick-dial telephone button on the storefront footer.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-maroon-100 space-y-4">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-maroon-800" />
            <h4 className="font-serif font-bold text-sm text-maroon-900">Social Media &amp; Contact Links</h4>
          </div>

          <div className="p-3.5 bg-maroon-50/50 rounded-xl border border-maroon-200/70 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-maroon-900 mb-1">
                  Choose Icon ({PRESELECTED_SOCIAL_ICONS.length} available)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 pointer-events-none text-maroon-800">
                    <SocialIcon iconId={selectedIconId} className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedIconId}
                    onChange={(e) => setSelectedIconId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-maroon-700 cursor-pointer"
                  >
                    {PRESELECTED_SOCIAL_ICONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-maroon-900 mb-1">
                  Label <span className="text-maroon-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder={currentSelectedOption.name}
                  className="w-full px-3 py-2 bg-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:ring-2 focus:ring-maroon-700"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-maroon-900 mb-1">
                  {selectedIconId === "whatsapp" ? "WhatsApp Number" : "Link URL"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onAddSocialLink();
                    }
                  }}
                  placeholder={
                    selectedIconId === "whatsapp"
                      ? "01700000000 or +8801700000000"
                      : currentSelectedOption.placeholder
                  }
                  className="w-full px-3 py-2 bg-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:ring-2 focus:ring-maroon-700"
                />
              </div>

              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={onAddSocialLink}
                  className="w-full py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 shadow-xs transition-colors cursor-pointer"
                  title="Add Link"
                >
                  <Plus className="w-4 h-4" />
                  <span className="sm:hidden">Add Link</span>
                </button>
              </div>
            </div>
          </div>

          {socialLinks.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-maroon-200 text-center text-maroon-600 text-xs">
              No social links configured. Select an icon above and enter a URL to add your first link.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {socialLinks.map((item, idx) => {
                const opt = getSocialIcon(item.icon);
                const activeUrl = formatSocialLink(item.icon, item.url);
                return (
                  <div
                    key={`${item.icon}-${idx}`}
                    className="flex items-center justify-between p-2.5 bg-off-white hover:bg-white rounded-xl border border-maroon-100 transition-colors shadow-2xs group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-maroon-900 text-cream flex items-center justify-center shrink-0 shadow-2xs">
                        <SocialIcon iconId={item.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-maroon-900 truncate">
                          {item.label || opt?.name || item.icon}
                        </p>
                        <a
                          href={activeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-maroon-600 hover:text-maroon-900 truncate flex items-center space-x-0.5"
                          title={activeUrl}
                        >
                          <span className="truncate max-w-[140px]">{item.url}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveSocialLink(idx)}
                      className="p-1.5 text-maroon-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Remove Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={updateSettingMutation.isPending}
          className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5 text-cream" />
          <span>Save Footer Info &amp; Social Links</span>
        </button>
      </form>
    </div>
  );
}
