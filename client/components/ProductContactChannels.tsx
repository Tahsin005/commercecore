"use client";

import { Phone, MessageCircle, CreditCard, ShieldCheck } from "lucide-react";
import { usePublicContactChannelsQuery, ContactChannelItem } from "@/hooks/useCmsQueries";

export function ProductContactChannels() {
  const { data: channels = [], isLoading } = usePublicContactChannelsQuery();
  const activeChannels = channels.filter((c) => c.isActive);

  if (isLoading || activeChannels.length === 0) {
    return null;
  }

  const renderIcon = (type: ContactChannelItem["type"]) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case "bkash":
      case "nagad":
        return <CreditCard className="w-4 h-4 text-pink-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-maroon-700" />;
    }
  };

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
    <div className="bg-off-white/80 rounded-2xl p-4 sm:p-5 border border-maroon-100 space-y-3 mt-4">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-maroon-800" />
        <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-maroon-900">
          Direct Order &amp; Helpline
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {activeChannels.map((channel) => {
          const href = getActionHref(channel);
          const isLink = Boolean(href);

          const content = (
            <div className="flex items-center space-x-2.5 p-2.5 bg-white rounded-xl border border-maroon-100 shadow-2xs hover:border-maroon-300 transition-all">
              <div className="p-2 bg-off-white rounded-lg shrink-0">{renderIcon(channel.type)}</div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-maroon-600 block leading-tight">
                  {channel.label}
                </span>
                <span className="text-xs font-bold font-mono text-maroon-900 block truncate">
                  {channel.phoneNumber}
                </span>
              </div>
            </div>
          );

          if (isLink) {
            return (
              <a
                key={channel.id}
                href={href}
                target={channel.type === "whatsapp" ? "_blank" : undefined}
                rel={channel.type === "whatsapp" ? "noopener noreferrer" : undefined}
                className="block cursor-pointer"
              >
                {content}
              </a>
            );
          }

          return <div key={channel.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
