"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, HelpCircle, RotateCcw } from "lucide-react";
import {
  usePublicProductBulletsQuery,
  usePublicContentBlockQuery,
} from "@/hooks/useCmsQueries";

interface ProductBulletsAndPolicyProps {
  productId: string;
}

export function ProductBulletsAndPolicy({ productId }: ProductBulletsAndPolicyProps) {
  const { data: bullets = [] } = usePublicProductBulletsQuery(productId);
  const { data: howToBuy } = usePublicContentBlockQuery("how_to_buy");
  const { data: returnPolicy } = usePublicContentBlockQuery("return_policy");

  const [activeTab, setActiveTab] = useState<"how_to_buy" | "return_policy">("how_to_buy");

  useEffect(() => {
    if (!howToBuy && returnPolicy) {
      setActiveTab("return_policy");
    }
  }, [howToBuy, returnPolicy]);

  const activeBullets = bullets.filter((b) => b.isActive);
  const hasBullets = activeBullets.length > 0;
  const hasBlocks = Boolean(howToBuy || returnPolicy);

  if (!hasBullets && !hasBlocks) {
    return null;
  }

  return (
    <div className="space-y-6 mt-8">
      {hasBullets && (
        <div className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-md space-y-3">
          <h3 className="font-serif font-bold text-base text-maroon-900 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Product Highlights &amp; Features</span>
          </h3>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {activeBullets.map((bullet) => (
              <li
                key={bullet.id}
                className="flex items-start space-x-2 text-xs text-maroon-800 font-sans leading-relaxed bg-off-white/80 p-2.5 rounded-xl border border-maroon-100/60"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{bullet.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasBlocks && (
        <div className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-md space-y-4">
          <div className="flex items-center space-x-2 border-b border-maroon-100 pb-3">
            {howToBuy && (
              <button
                type="button"
                onClick={() => setActiveTab("how_to_buy")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "how_to_buy"
                    ? "bg-maroon-900 text-white shadow-xs"
                    : "bg-off-white text-maroon-800 hover:bg-maroon-100 border border-maroon-200"
                }`}
              >
                <HelpCircle className="w-4 h-4 text-cream" />
                <span>{howToBuy.title || "How to Buy"}</span>
              </button>
            )}

            {returnPolicy && (
              <button
                type="button"
                onClick={() => setActiveTab("return_policy")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
                  activeTab === "return_policy"
                    ? "bg-maroon-900 text-white shadow-xs"
                    : "bg-off-white text-maroon-800 hover:bg-maroon-100 border border-maroon-200"
                }`}
              >
                <RotateCcw className="w-4 h-4 text-cream" />
                <span>{returnPolicy.title || "Return Policy"}</span>
              </button>
            )}
          </div>

          <div className="bg-off-white/60 p-4 sm:p-5 rounded-xl border border-maroon-100 text-xs text-maroon-900 leading-relaxed font-sans whitespace-pre-line">
            {activeTab === "how_to_buy" && howToBuy && (
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-maroon-900">{howToBuy.title}</h4>
                <p className="text-maroon-800">{howToBuy.body}</p>
              </div>
            )}

            {activeTab === "return_policy" && returnPolicy && (
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-maroon-900">{returnPolicy.title}</h4>
                <p className="text-maroon-800">{returnPolicy.body}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
