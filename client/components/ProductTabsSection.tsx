"use client";

import { useState } from "react";
import { usePublicContentBlockQuery } from "@/hooks/useCmsQueries";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProductTabsSectionProps {
  product: {
    id: string;
    name: string;
    description?: string;
    code?: string;
    categoryId?: { name: string } | null;
    [key: string]: any;
  };
}

export function ProductTabsSection({ product }: ProductTabsSectionProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"description" | "how_to_buy" | "return_policy">("description");

  const { data: howToBuy } = usePublicContentBlockQuery("how_to_buy");
  const { data: returnPolicy } = usePublicContentBlockQuery("return_policy");

  return (
    <div className="w-full space-y-6 mt-8 font-sans">
      <div className="bg-maroon-100/80 w-full flex items-center overflow-x-auto scrollbar-none rounded-t-xl border border-maroon-200/80">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "description"
              ? "bg-maroon-900 text-cream shadow-xs"
              : "text-maroon-800 hover:text-maroon-900 hover:bg-maroon-200/60"
          }`}
        >
          {t.productDetails.descriptionTab}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("how_to_buy")}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "how_to_buy"
              ? "bg-maroon-900 text-cream shadow-xs"
              : "text-maroon-800 hover:text-maroon-900 hover:bg-maroon-200/60"
          }`}
        >
          {t.productDetails.howToBuyTab}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("return_policy")}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "return_policy"
              ? "bg-maroon-900 text-cream shadow-xs"
              : "text-maroon-800 hover:text-maroon-900 hover:bg-maroon-200/60"
          }`}
        >
          {t.productDetails.returnPolicyTab}
        </button>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-b-xl border border-maroon-100 shadow-sm min-h-[160px]">
        {activeTab === "description" && (
          <div className="space-y-3 max-w-3xl">
            <h3 className="font-serif font-bold text-lg text-maroon-900">{product.name}</h3>
            <p className="text-sm text-maroon-800 leading-relaxed font-sans whitespace-pre-line">
              {product.description || t.home.noDescription}
            </p>
          </div>
        )}

        {activeTab === "how_to_buy" && (
          <div className="space-y-3 max-w-3xl">
            <div className="text-sm text-maroon-800 leading-relaxed whitespace-pre-line bg-maroon-50/40 p-5 rounded-xl border border-maroon-100 font-sans">
              {howToBuy?.body || t.productDetails?.howToBuyFallback || "Select desired items, add to cart or click 'Order Now', fill out customer details, and confirm Cash-on-Delivery order."}
            </div>
          </div>
        )}

        {activeTab === "return_policy" && (
          <div className="space-y-3 max-w-3xl">
            <div className="text-sm text-maroon-800 leading-relaxed whitespace-pre-line bg-maroon-50/40 p-5 rounded-xl border border-maroon-100 font-sans">
              {returnPolicy?.body || t.productDetails?.returnPolicyFallback || "Returns accepted within 7 days of delivery for unused items in original packaging. Contact customer support for hassle-free returns."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
