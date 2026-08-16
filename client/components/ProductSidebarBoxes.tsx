"use client";

import {
  Check,
  ThumbsUp,
  Package,
  Truck,
  Phone,
  MessageCircle,
} from "lucide-react";
import {
  usePublicContactChannelsQuery,
  usePublicProductBulletsQuery,
  ContactChannelItem,
} from "@/hooks/useCmsQueries";
import { useSiteSettingsQuery } from "@/hooks/useSettingsQueries";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProductSidebarBoxesProps {
  productId: string;
}

export function ProductSidebarBoxes({ productId }: ProductSidebarBoxesProps) {
  const { t } = useLanguage();
  const { data: channels = [] } = usePublicContactChannelsQuery();
  const { data: bullets = [] } = usePublicProductBulletsQuery(productId);
  const { data: settings } = useSiteSettingsQuery();

  const insideDhaka = settings?.delivery_charge?.insideDhaka ?? 60;
  const outsideDhaka = settings?.delivery_charge?.outsideDhaka ?? 120;

  const activeChannels = channels.filter((c) => c.isActive);
  const activeBullets = bullets.filter((b) => b.isActive);

  const getActionHref = (channel: ContactChannelItem) => {
    const rawNumber = channel.phoneNumber.replace(/\D/g, "");
    switch (channel.type) {
      case "call":
        return `tel:${channel.phoneNumber}`;
      case "whatsapp":
        return `https://wa.me/${rawNumber.startsWith("88") ? rawNumber : `88${rawNumber}`}`;
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-maroon-200 bg-maroon-50/40 rounded-xl p-4 space-y-2.5 font-sans">
        {activeBullets.length > 0 ? (
          activeBullets.map((bullet) => (
            <div key={bullet.id} className="flex items-start space-x-2 text-xs text-maroon-900 font-medium">
              <Check className="w-4 h-4 text-maroon-800 shrink-0 mt-0.5" />
              <span>{bullet.text}</span>
            </div>
          ))
        ) : (
          <>
            <div className="flex items-start space-x-2 text-xs text-maroon-900 font-medium">
              <Check className="w-4 h-4 text-maroon-800 shrink-0 mt-0.5" />
              <span>{t.productDetails.orderTodayEst}</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-maroon-900 font-medium">
              <ThumbsUp className="w-4 h-4 text-maroon-800 shrink-0" />
              <span>{t.productDetails.qualityProduct}</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-maroon-900 font-medium">
              <Package className="w-4 h-4 text-maroon-800 shrink-0" />
              <span>{t.productDetails.codAvailable}</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-maroon-900 font-medium">
              <Truck className="w-4 h-4 text-maroon-800 shrink-0" />
              <span>
                {t.productDetails.deliveryChargeInside} {insideDhaka} TK
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-maroon-900 font-medium">
              <Truck className="w-4 h-4 text-maroon-800 shrink-0" />
              <span>
                {t.productDetails.deliveryChargeOutside} {outsideDhaka} TK
              </span>
            </div>
          </>
        )}
      </div>

      {activeChannels.length > 0 && (
        <div className="border-2 border-dashed border-maroon-200 bg-maroon-50/40 rounded-xl p-4 space-y-3 font-sans">
          <h4 className="text-xs font-semibold text-maroon-900 leading-snug">
            {t.productDetails.haveQuestionCall}
          </h4>

          <div className="space-y-2">
            {activeChannels.map((channel) => {
              const href = getActionHref(channel);

              const badgeLabel =
                channel.type === "bkash"
                  ? "Bkash Personal"
                  : channel.type === "nagad"
                  ? "Nagad Personal"
                  : null;

              return (
                <div key={channel.id} className="flex items-center space-x-2 text-xs">
                  {href ? (
                    <a
                      href={href}
                      target={channel.type === "whatsapp" ? "_blank" : undefined}
                      rel={channel.type === "whatsapp" ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center space-x-1.5 text-maroon-800 hover:text-maroon-900 font-mono font-bold hover:underline cursor-pointer"
                    >
                      {channel.type === "whatsapp" ? (
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Phone className="w-3.5 h-3.5 text-maroon-700 shrink-0" />
                      )}
                      <span>{channel.phoneNumber}</span>
                    </a>
                  ) : (
                    <div className="inline-flex items-center space-x-1.5 text-maroon-900 font-mono font-bold">
                      <Phone className="w-3.5 h-3.5 text-maroon-700 shrink-0" />
                      <span>{channel.phoneNumber}</span>
                    </div>
                  )}

                  {badgeLabel && (
                    <span className="text-[10px] font-semibold text-maroon-800 bg-maroon-100 border border-maroon-200 px-1.5 py-0.5 rounded">
                      {badgeLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
