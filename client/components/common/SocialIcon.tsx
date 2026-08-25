import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaTiktok,
  FaXTwitter,
  FaTelegram,
  FaLinkedin,
  FaFacebookMessenger,
  FaPinterest,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaLocationDot,
  FaShop,
} from "react-icons/fa6";
import { IconType } from "react-icons";

export interface SocialIconOption {
  id: string;
  name: string;
  placeholder: string;
  icon: IconType;
  category: "social" | "contact" | "general";
}

export const PRESELECTED_SOCIAL_ICONS: SocialIconOption[] = [
  {
    id: "facebook",
    name: "Facebook",
    placeholder: "https://facebook.com/yourpage",
    icon: FaFacebook,
    category: "social",
  },
  {
    id: "instagram",
    name: "Instagram",
    placeholder: "https://instagram.com/yourprofile",
    icon: FaInstagram,
    category: "social",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    placeholder: "01700000000 or +8801700000000",
    icon: FaWhatsapp,
    category: "social",
  },
  {
    id: "youtube",
    name: "YouTube",
    placeholder: "https://youtube.com/@yourchannel",
    icon: FaYoutube,
    category: "social",
  },
  {
    id: "tiktok",
    name: "TikTok",
    placeholder: "https://tiktok.com/@youraccount",
    icon: FaTiktok,
    category: "social",
  },
  {
    id: "x-twitter",
    name: "X (Twitter)",
    placeholder: "https://x.com/yourprofile",
    icon: FaXTwitter,
    category: "social",
  },
  {
    id: "telegram",
    name: "Telegram",
    placeholder: "https://t.me/yourusername",
    icon: FaTelegram,
    category: "social",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    placeholder: "https://linkedin.com/company/yourcompany",
    icon: FaLinkedin,
    category: "social",
  },
  {
    id: "messenger",
    name: "Messenger",
    placeholder: "https://m.me/yourpage",
    icon: FaFacebookMessenger,
    category: "social",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    placeholder: "https://pinterest.com/yourprofile",
    icon: FaPinterest,
    category: "social",
  },
  {
    id: "email",
    name: "Email",
    placeholder: "mailto:support@rupzon.com",
    icon: FaEnvelope,
    category: "contact",
  },
  {
    id: "phone",
    name: "Phone",
    placeholder: "tel:+8801700000000",
    icon: FaPhone,
    category: "contact",
  },
  {
    id: "website",
    name: "Website",
    placeholder: "https://rupzon.com",
    icon: FaGlobe,
    category: "general",
  },
  {
    id: "location",
    name: "Location / Map",
    placeholder: "https://maps.google.com/?q=...",
    icon: FaLocationDot,
    category: "general",
  },
  {
    id: "store",
    name: "Store / Outlet",
    placeholder: "https://rupzon.com/stores",
    icon: FaShop,
    category: "general",
  },
];

export const SOCIAL_ICON_MAP: Record<string, SocialIconOption> = PRESELECTED_SOCIAL_ICONS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<string, SocialIconOption>
);

export function getSocialIcon(id: string): SocialIconOption | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase().trim();
  if (SOCIAL_ICON_MAP[normalized]) return SOCIAL_ICON_MAP[normalized];
  if (normalized === "twitter") return SOCIAL_ICON_MAP["x-twitter"];
  if (normalized === "mail") return SOCIAL_ICON_MAP["email"];
  return undefined;
}

interface SocialIconProps {
  iconId: string;
  className?: string;
}

export function SocialIcon({ iconId, className }: SocialIconProps) {
  const iconOption = getSocialIcon(iconId);
  if (!iconOption) {
    return <FaGlobe className={className} />;
  }
  const IconComponent = iconOption.icon;
  return <IconComponent className={className} />;
}

export function formatSocialLink(icon: string, rawUrl: string): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  const lowerTrimmed = trimmed.toLowerCase();
  const iconLower = (icon || "").toLowerCase().trim();

  if (iconLower === "whatsapp") {
    if (lowerTrimmed.startsWith("http://") || lowerTrimmed.startsWith("https://") || lowerTrimmed.startsWith("whatsapp://")) {
      return trimmed;
    }
    const cleanDigits = trimmed.replace(/[^0-9]/g, "");
    if (!cleanDigits) return trimmed;

    // If 11 digits starting with 01 (standard Bangladesh phone format e.g. 01700000000)
    if (cleanDigits.startsWith("01") && cleanDigits.length === 11) {
      return `https://wa.me/88${cleanDigits}`;
    }
    return `https://wa.me/${cleanDigits}`;
  }

  if (iconLower === "phone") {
    if (lowerTrimmed.startsWith("tel:")) return trimmed;
    return `tel:${trimmed}`;
  }

  if (iconLower === "email" || iconLower === "mail") {
    if (lowerTrimmed.startsWith("mailto:")) return trimmed;
    return `mailto:${trimmed}`;
  }

  if (
    !lowerTrimmed.startsWith("http://") &&
    !lowerTrimmed.startsWith("https://") &&
    !lowerTrimmed.startsWith("mailto:") &&
    !lowerTrimmed.startsWith("tel:")
  ) {
    return `https://${trimmed}`;
  }

  return trimmed;
}
