"use client";

import { ProductCard } from "@/components/ProductCard";
import { useProductsQuery } from "@/hooks/useProductQueries";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface RelatedProductsSectionProps {
  categoryId?: string | null;
  currentProductId: string;
}

export function RelatedProductsSection({ categoryId, currentProductId }: RelatedProductsSectionProps) {
  const { t } = useLanguage();

  const { data: response, isLoading } = useProductsQuery({
    categoryId: categoryId || undefined,
    limit: 6,
  });

  const products = response?.data?.products || [];
  const relatedProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (isLoading || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6 mt-12 font-sans pt-6 border-t border-maroon-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900 tracking-tight">
            {t.productDetails?.relatedProducts || "Related Products"}
          </h2>
          <p className="text-xs text-maroon-700 mt-0.5">
            {t.productDetails?.relatedProductsDesc || "Explore other items from this category"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
