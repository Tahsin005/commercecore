"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Package,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ZoomIn,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useProductDetailsQuery, ProductVariant } from "@/hooks/useProductQueries";
import { usePublicContactChannelsQuery } from "@/hooks/useCmsQueries";
import { useSiteSettingsQuery } from "@/hooks/useSettingsQueries";
import { getDiscountedPrice, useActiveDiscount } from "@/lib/discount";
import { ProductDetailsSkeleton } from "@/components/skeletons";
import { ProductReviewsSection } from "@/components/ProductReviewsSection";
import { ProductSidebarBoxes } from "@/components/ProductSidebarBoxes";
import { ProductTabsSection } from "@/components/ProductTabsSection";
import { RelatedProductsSection } from "@/components/RelatedProductsSection";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLanguage();
  const { data: siteSettings } = useSiteSettingsQuery();
  const { data: contactChannels = [] } = usePublicContactChannelsQuery();
  const whatsappChannel = contactChannels.find((c) => c.isActive && c.type === "whatsapp");
  const discountSetting = siteSettings?.site_discount;
  const hasSitewideDiscount = useActiveDiscount(discountSetting);

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleCopyCode = () => {
    if (!product?.code) return;
    navigator.clipboard.writeText(product.code);
    setCopiedCode(true);
    toast.success("Product code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomPos({ x: 50, y: 50 });
  };

  // react Query hook for product details
  const { data: response, isLoading, error } = useProductDetailsQuery(id);
  const product = response?.data;

  // Set default selected variant when product data loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const { addItem: addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-maroon-100 text-center space-y-4">
            <Package className="w-12 h-12 text-maroon-300 mx-auto" />
            <h1 className="text-2xl font-serif font-bold text-maroon-900">{t.productDetails.notFoundTitle}</h1>
            <p className="text-xs text-maroon-700">{t.productDetails.notFoundDesc}</p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-maroon-900 text-white font-medium text-xs rounded-md shadow hover:bg-maroon-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.common.backToShop}</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const getVariantEffectivePrice = (variant?: ProductVariant | null, fallbackPrice: number = 0): number => {
    if (!variant) return fallbackPrice;
    return variant.overridePrice ?? variant.price ?? fallbackPrice;
  };

  const basePrice = product.price !== undefined && product.price !== null ? product.price : (product.defaultPrice || 0);
  const currentPrice = getVariantEffectivePrice(selectedVariant, basePrice);

  const stockQuantity = selectedVariant ? (selectedVariant.quantity ?? 0) : (product.quantity ?? 0);
  const isOutOfStock = stockQuantity <= 0;
  const wishlisted = isInWishlist(product.id);

  const images = product.images || [];
  const currentImage = images.length > 0 ? images[selectedImageIndex] || images[0] : null;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error(t.productDetails.outOfStockMsg);
      return;
    }

    const selectedLabel = selectedVariant?.label || selectedVariant?.size || t.common.standard;

    addToCart(
      {
        productVariantId: selectedVariant?.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        size: selectedLabel,
        price: currentPrice,
        imageUrl: currentImage || undefined,
      },
      quantity
    );
    toast.success(`${quantity} x "${product.name}" (${selectedLabel}) ${t.productDetails.addedToCart}`);
  };

  const handleToggleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.success(`"${product.name}" ${t.home.removeFromWishlist}`);
    } else {
      const selectedLabel = selectedVariant?.label || selectedVariant?.size || t.common.standard;
      addToWishlist({
        productVariantId: selectedVariant?.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        size: selectedLabel,
        price: currentPrice,
        imageUrl: product.images?.[0],
      });
      toast.success(`"${product.name}" ${t.home.addToWishlist}`);
    }
  };

  const handleOrderNow = () => {
    if (isOutOfStock) {
      toast.error(t.productDetails.outOfStockMsg);
      return;
    }

    const selectedLabel = selectedVariant?.label || selectedVariant?.size || t.common.standard;

    addToCart(
      {
        productVariantId: selectedVariant?.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        size: selectedLabel,
        price: currentPrice,
        imageUrl: currentImage || undefined,
      },
      quantity
    );
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-maroon-800 hover:text-maroon-900 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.common.backToShop}</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-maroon-100 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-5 flex flex-col items-center justify-start">
            <div className="relative w-full">
              {hasSitewideDiscount && (
                <span className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-mono text-xs font-black tracking-wider px-2.5 py-1 rounded-md shadow-md border-2 border-white uppercase z-20 pointer-events-none">
                  {discountSetting?.discountPercentage}% OFF
                </span>
              )}

              <div
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative w-full h-96 sm:h-[460px] rounded-xl overflow-hidden flex items-center justify-center bg-off-white border border-maroon-100/80 shadow-xs cursor-zoom-in group select-none"
              >
                {currentImage ? (
                  <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                    <Image
                      src={currentImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className={`object-contain transition-transform duration-150 ease-out ${
                        isZoomed ? "scale-250 cursor-zoom-in" : "scale-100"
                      }`}
                      style={{
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }}
                      priority
                    />

                    <div
                      className={`absolute bottom-3 right-3 bg-maroon-900/80 text-cream text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center space-x-1 transition-opacity duration-200 pointer-events-none ${
                        isZoomed ? "opacity-0" : "opacity-90"
                      }`}
                    >
                      <ZoomIn className="w-3 h-3 text-cream" />
                      <span>{t.productDetails.hoverToZoom}</span>
                    </div>
                  </div>
                ) : (
                  <Package className="w-32 h-32 text-maroon-300" />
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2.5 mt-4 pt-3 border-t border-maroon-100/80 w-full overflow-x-auto overflow-y-hidden py-1 scrollbar-none">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-maroon-900 ring-2 ring-maroon-700/30 scale-105"
                        : "border-maroon-200 hover:border-maroon-500 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {product.categoryId && (
                  <div className="mt-1">
                    <span className="inline-block bg-maroon-100/70 border border-maroon-200/80 text-maroon-900 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                      {product.categoryId.name}
                    </span>
                  </div>
                )}

                {whatsappChannel && (() => {
                  const rawNum = whatsappChannel.phoneNumber.replace(/\D/g, "");
                  const formattedNum = rawNum.startsWith("88") ? rawNum : `88${rawNum}`;
                  const waUrl = `https://wa.me/${formattedNum}?text=${encodeURIComponent(`Hi, I would like to ask details about ${product.name}`)}`;

                  return (
                    <div className="mt-2 flex items-center space-x-2 text-xs">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{t.productDetails.askForDetails}</span>
                      </a>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-3 border-t border-maroon-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-maroon-500 block mb-0.5">
                    {t.common.price}
                  </span>
                  {hasSitewideDiscount ? (
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold font-mono text-maroon-900">
                        ৳{getDiscountedPrice(currentPrice, discountSetting).toFixed(2)}
                      </span>
                      <span className="text-sm font-mono text-maroon-700/60 line-through">
                        ৳{currentPrice.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold font-mono text-maroon-900">
                      ৳{currentPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div>
                  {!isOutOfStock ? (
                    <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.common.inStock} ({stockQuantity})</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-red-800 bg-red-50 border border-red-200/80 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs">
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{t.common.outOfStock}</span>
                    </div>
                  )}
                </div>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="pt-1">
                  <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                    {t.productDetails.selectAgeRange}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {product.variants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      const label = variant.label || variant.size || t.common.standard;
                      const vPrice = getVariantEffectivePrice(variant, basePrice);
                      const isVOutOfStock = (variant.quantity ?? 0) <= 0;

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }}
                          className={`px-3 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                            isVOutOfStock
                              ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-70 cursor-not-allowed"
                              : isSelected
                              ? "bg-maroon-900 text-cream border-maroon-900 shadow-xs ring-1 ring-maroon-700"
                              : "bg-white text-maroon-800 border-maroon-200 hover:bg-maroon-50"
                          }`}
                        >
                          <span>{label}</span>
                          {vPrice !== product.price && (
                            <span className={`text-[10px] ${isSelected ? "text-cream/80" : "text-maroon-600"}`}>
                              (৳{vPrice})
                            </span>
                          )}
                          {isVOutOfStock && (
                            <span className="text-[9px] uppercase tracking-tight font-mono text-red-500 font-normal">
                              ({t.common.outOfStock})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-1">
                <label className="block text-xs font-bold text-maroon-900 mb-1.5">
                  {t.productDetails.selectQuantity}
                </label>
                <div className="inline-flex items-center border border-maroon-200 rounded-md bg-off-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="p-2 hover:bg-maroon-100 text-maroon-800 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-xs text-maroon-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={isOutOfStock || quantity >= stockQuantity}
                    className="p-2 hover:bg-maroon-100 text-maroon-800 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-maroon-100">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="py-2.5 px-3 bg-maroon-800 hover:bg-maroon-700 active:scale-[0.98] text-white font-semibold text-xs rounded-md transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-cream" />
                  <span>{t.productDetails.addToCart}</span>
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`py-2.5 px-3 border font-semibold text-xs rounded-md transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer ${
                    wishlisted
                      ? "bg-maroon-900 text-cream border-maroon-800"
                      : "bg-white text-maroon-800 border-maroon-200 hover:bg-maroon-50"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-cream" : ""}`} />
                  <span>{wishlisted ? t.productDetails.wishlisted : t.productDetails.wishlist}</span>
                </button>
              </div>

              <button
                onClick={handleOrderNow}
                disabled={isOutOfStock}
                className="w-full py-3 px-4 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-semibold text-xs rounded-md transition-all flex items-center justify-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-cream" />
                <span>{t.productDetails.orderNow}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-2.5">
            {product.code && (
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-off-white border border-maroon-200/80 rounded font-mono text-[10px] font-bold text-maroon-700">
                <span className="text-[9px] text-maroon-500 font-sans uppercase tracking-wider font-semibold">{t.common.code}:</span>
                <span>{product.code}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-0.5 hover:bg-maroon-100 text-maroon-600 hover:text-maroon-900 rounded transition-colors cursor-pointer ml-1"
                  title="Copy product code"
                >
                  {copiedCode ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}
            <ProductSidebarBoxes productId={product.id} />
          </div>
        </div>

        <ProductTabsSection product={product} />

        <ProductReviewsSection productId={product.id} />

        <RelatedProductsSection
          categoryId={typeof product.categoryId === "object" && product.categoryId ? product.categoryId.id : (product.categoryId as any)}
          currentProductId={product.id}
        />
      </main>
    </div>
  );
}
