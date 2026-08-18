"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Heart,
  ArrowRight,
  Phone,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSiteSettingsQuery } from "@/hooks/useSettingsQueries";
import { usePublicContentBlockQuery } from "@/hooks/useCmsQueries";

export function Footer() {
  const { t } = useLanguage();
  const { data: settings } = useSiteSettingsQuery();
  const { data: aboutUs } = usePublicContentBlockQuery("about_us");
  const { data: contactUs } = usePublicContentBlockQuery("contact_us");

  const footerSettings = settings?.footer_settings;
  const helplineNumber = settings?.helpline_number || footerSettings?.helpline || "01700000000";
  const brandDescription = aboutUs?.body || footerSettings?.description || t.footer.brandDesc;

  return (
    <footer className="bg-maroon-900 text-white border-t border-maroon-800 font-sans mt-auto">
      <div className="border-b border-maroon-800/80 bg-maroon-900/80 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
          <div className="flex items-center space-x-3 p-3.5 bg-maroon-900/50 rounded-xl border border-maroon-800/80 shadow-xs">
            <div className="p-2.5 bg-maroon-800/90 border border-maroon-700 rounded-lg text-cream shrink-0">
              <Truck className="w-5 h-5 text-cream" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t.footer.fastDeliveryTitle}</h4>
              <p className="text-[11px] text-maroon-200 mt-0.5">{t.footer.fastDeliveryDesc}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 bg-maroon-900/50 rounded-xl border border-maroon-800/80 shadow-xs">
            <div className="p-2.5 bg-maroon-800/90 border border-maroon-700 rounded-lg text-cream shrink-0">
              <CreditCard className="w-5 h-5 text-cream" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t.footer.codTitle}</h4>
              <p className="text-[11px] text-maroon-200 mt-0.5">{t.footer.codDesc}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 bg-maroon-900/50 rounded-xl border border-maroon-800/80 shadow-xs sm:col-span-2 md:col-span-1">
            <div className="p-2.5 bg-maroon-800/90 border border-maroon-700 rounded-lg text-cream shrink-0">
              <ShieldCheck className="w-5 h-5 text-cream" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t.footer.qualityTitle}</h4>
              <p className="text-[11px] text-maroon-200 mt-0.5">{t.footer.qualityDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8">
        <div className="sm:col-span-2 md:col-span-5 space-y-4">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-cream transition-colors shrink-0">
              <Image
                src="/logo.png"
                alt="Rupzon Collection Logo"
                width={32}
                height={32}
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-cream transition-colors">
              {t.common.commerceCore}
            </span>
          </Link>

          <p className="text-xs text-maroon-200 leading-relaxed max-w-sm font-sans line-clamp-4">
            {brandDescription}
          </p>
        </div>

        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cream font-serif">{t.footer.quickNav}</h4>
          <ul className="space-y-2.5 text-xs text-maroon-200 font-sans">
            <li>
              <Link href="/" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-cream/70 shrink-0" />
                <span>{t.footer.shopProducts}</span>
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-cream/70 shrink-0" />
                <span>{t.footer.viewCheckout}</span>
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-cream/70 shrink-0" />
                <span>{t.footer.accountLogin}</span>
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-cream/70 shrink-0" />
                <span>{t.footer.registerAccount}</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cream font-serif">{t.footer.deliverySupport}</h4>
          <p className="text-xs text-maroon-200 leading-relaxed font-sans line-clamp-3">
            {contactUs?.body || t.footer.supportDesc}
          </p>
          <div className="pt-1">
            <a
              href={`tel:${helplineNumber}`}
              className="inline-flex items-center space-x-2 text-[11px] font-semibold text-cream bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 px-3 py-1.5 rounded-md shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-cream" />
              <span>{t.footer?.helplineLabel || "Helpline:"} {helplineNumber}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-maroon-800/80 bg-maroon-900 py-4 text-xs text-maroon-200 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} {t.common.commerceCore}। {t.footer.copyright}</p>
          <p className="flex items-center justify-center space-x-1 text-[11px] text-maroon-200">
            <span>{t.footer.craftedWith}</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>{t.footer.forEcommerce}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
