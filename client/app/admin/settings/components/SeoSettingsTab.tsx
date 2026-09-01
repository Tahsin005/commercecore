"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Search,
  Globe,
  Share2,
  Save,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import {
  useAdminSeoListQuery,
  useUpsertSeoMutation,
  useDeleteSeoMutation,
} from "@/hooks/useSeoQueries";
import { seoMetaFormSchema, SeoMetaFormInput, SeoMetaItem } from "@/lib/validations/seo";
import { siteConfig } from "@/lib/seo/site-config";

export const AVAILABLE_FRONTEND_ROUTES = [
  { label: "Homepage (/)", route: "/", description: "Storefront landing page & banners" },
  { label: "Products Catalog (/categories)", route: "/categories", description: "Browse collections & product filter catalog" },
  { label: "Customer Sign In (/login)", route: "/login", description: "Customer login & authentication" },
  { label: "Customer Registration (/signup)", route: "/signup", description: "New account creation page" },
  { label: "My Profile & Orders (/profile)", route: "/profile", description: "Customer account dashboard & order history" },
  { label: "Cart & Checkout (/checkout)", route: "/checkout", description: "Cart review & cash-on-delivery checkout" },
];

export function SeoSettingsTab() {
  const { data: seoList = [], isLoading } = useAdminSeoListQuery();
  const upsertMutation = useUpsertSeoMutation();
  const deleteMutation = useDeleteSeoMutation();

  const [selectedRoute, setSelectedRoute] = useState<string>("/");
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SeoMetaFormInput>({
    resolver: zodResolver(seoMetaFormSchema),
    defaultValues: {
      route: "/",
      title: "",
      description: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
      keywords: "",
      noIndex: false,
    },
  });

  const currentRoute = watch("route") || selectedRoute;
  const currentTitle = watch("title") || "";
  const currentDesc = watch("description") || "";
  const currentOgImage = watch("ogImage") || "";
  const currentNoIndex = watch("noIndex") || false;

  // Load existing metadata into form when selected route changes
  useEffect(() => {
    setValue("route", selectedRoute);

    const existing = seoList.find((item) => item.route === selectedRoute);
    if (existing) {
      setEditingId(existing.id || null);
      setValue("title", existing.title || "");
      setValue("description", existing.description || "");
      setValue("ogTitle", existing.ogTitle || "");
      setValue("ogDescription", existing.ogDescription || "");
      setValue("ogImage", existing.ogImage || "");
      setValue("canonicalUrl", existing.canonicalUrl || "");
      setValue("keywords", Array.isArray(existing.keywords) ? existing.keywords.join(", ") : "");
      setValue("noIndex", existing.noIndex || false);
    } else {
      setEditingId(null);
      setValue("title", "");
      setValue("description", "");
      setValue("ogTitle", "");
      setValue("ogDescription", "");
      setValue("ogImage", "");
      setValue("canonicalUrl", "");
      setValue("keywords", "");
      setValue("noIndex", false);
    }
  }, [selectedRoute, seoList, setValue]);

  const handleEditEntry = (entry: SeoMetaItem) => {
    setSelectedRoute(entry.route);
    setEditingId(entry.id || null);
    setValue("route", entry.route);
    setValue("title", entry.title || "");
    setValue("description", entry.description || "");
    setValue("ogTitle", entry.ogTitle || "");
    setValue("ogDescription", entry.ogDescription || "");
    setValue("ogImage", entry.ogImage || "");
    setValue("canonicalUrl", entry.canonicalUrl || "");
    setValue("keywords", Array.isArray(entry.keywords) ? entry.keywords.join(", ") : "");
    setValue("noIndex", entry.noIndex || false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteEntry = (entry: SeoMetaItem) => {
    if (!entry.id) return;
    if (confirm(`Reset custom SEO settings for "${entry.route}" to system defaults?`)) {
      deleteMutation.mutate(entry.id, {
        onSuccess: () => {
          toast.success(`SEO override for ${entry.route} removed`);
          if (currentRoute === entry.route) {
            reset({
              route: entry.route,
              title: "",
              description: "",
              ogTitle: "",
              ogDescription: "",
              ogImage: "",
              canonicalUrl: "",
              keywords: "",
              noIndex: false,
            });
            setEditingId(null);
          }
        },
      });
    }
  };

  const onSubmit = (data: SeoMetaFormInput) => {
    const keywordsArray =
      typeof data.keywords === "string"
        ? data.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
        : data.keywords || [];

    upsertMutation.mutate(
      {
        ...data,
        route: selectedRoute,
        keywords: keywordsArray,
      },
      {
        onSuccess: () => {
          toast.success(`SEO settings saved for ${selectedRoute}!`);
        },
      }
    );
  };

  // Preview computations
  const previewTitle = currentTitle || siteConfig.name;
  const previewDescription = currentDesc || siteConfig.description;
  const previewUrl = `${siteConfig.url.replace(/\/$/, "")}${selectedRoute === "/" ? "" : selectedRoute}`;
  const previewOgImage = currentOgImage || siteConfig.ogImage;
  const currentPresetConfig =
    AVAILABLE_FRONTEND_ROUTES.find((r) => r.route === selectedRoute) || AVAILABLE_FRONTEND_ROUTES[0];

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-maroon-100/70 rounded-xl text-maroon-800 shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-maroon-900">
              Frontend SEO &amp; Meta Management
            </h2>
            <p className="text-xs text-maroon-700 mt-0.5">
              Customize meta titles, descriptions, and OpenGraph tags for frontend customer routes.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-maroon-50 px-3.5 py-2 rounded-xl border border-maroon-200/60 shrink-0">
          <Layers className="w-4 h-4 text-maroon-700" />
          <span className="text-xs font-semibold text-maroon-900">
            {seoList.length} of {AVAILABLE_FRONTEND_ROUTES.length} routes customized
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="border-b border-maroon-100 pb-3 flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-maroon-900 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-maroon-800" />
                <span>Select Frontend Page</span>
              </h3>
              {editingId && (
                <span className="text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  Active Override Saved
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-maroon-900 mb-1">
                Choose Frontend Page
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-3 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-maroon-700 cursor-pointer shadow-xs"
              >
                {AVAILABLE_FRONTEND_ROUTES.map((p) => {
                  const hasCustom = seoList.some((s) => s.route === p.route);
                  return (
                    <option key={p.route} value={p.route}>
                      {p.label} {hasCustom ? "✓ (Customized)" : ""}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-maroon-600 mt-1">
                {currentPresetConfig.description} (URL: <code className="font-mono text-maroon-900">{currentPresetConfig.route}</code>)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-maroon-900">
                  Meta Title (Browser &amp; Search Title)
                </label>
                <span
                  className={`text-[11px] font-mono ${currentTitle.length > 65 ? "text-amber-600 font-bold" : "text-maroon-500"
                    }`}
                >
                  {currentTitle.length}/60 chars
                </span>
              </div>
              <input
                type="text"
                {...register("title")}
                placeholder={`e.g. ${currentPresetConfig.label.split(" (")[0]} | Commerce Core`}
                className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-maroon-700"
              />
              {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-maroon-900">
                  Meta Description (SERP Snippet)
                </label>
                <span
                  className={`text-[11px] font-mono ${currentDesc.length > 160 ? "text-amber-600 font-bold" : "text-maroon-500"
                    }`}
                >
                  {currentDesc.length}/160 chars
                </span>
              </div>
              <textarea
                rows={3}
                {...register("description")}
                placeholder="Enter engaging summary for search engine results..."
                className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-maroon-700 resize-none"
              />
              {errors.description && <p className="text-red-500 text-[11px] mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-maroon-900 mb-1">
                OpenGraph Social Image URL <span className="text-maroon-500 font-normal">(Optional)</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2.5 pointer-events-none text-maroon-500">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  {...register("ogImage")}
                  placeholder="https://res.cloudinary.com/... or /logo.png"
                  className="w-full pl-8 pr-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-maroon-700"
                />
              </div>
              <p className="text-[11px] text-maroon-600 mt-1">
                Used for social sharing cards on WhatsApp, Facebook, and Twitter.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-maroon-900 mb-1">
                Meta Keywords <span className="text-maroon-500 font-normal">(Comma separated)</span>
              </label>
              <input
                type="text"
                {...register("keywords")}
                placeholder="saree, bangladeshi fashion, jamdani, online shop"
                className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-maroon-700"
              />
            </div>

            <div className="pt-3 border-t border-maroon-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-maroon-900 mb-1">
                  Canonical URL Override <span className="text-maroon-500 font-normal">(Leave empty for default)</span>
                </label>
                <input
                  type="text"
                  {...register("canonicalUrl")}
                  placeholder={previewUrl}
                  className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-maroon-700"
                />
              </div>

              <div className="flex items-center space-x-2.5 pt-1">
                <input
                  type="checkbox"
                  id="noIndex"
                  {...register("noIndex")}
                  className="w-4 h-4 text-maroon-800 rounded border-maroon-300 focus:ring-maroon-700 cursor-pointer"
                />
                <label htmlFor="noIndex" className="text-xs font-semibold text-maroon-900 cursor-pointer flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exclude this page from Search Engine Indexing (noindex)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={upsertMutation.isPending}
              className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60 mt-2"
            >
              <Save className="w-3.5 h-3.5 text-cream" />
              <span>{upsertMutation.isPending ? "Saving SEO Meta..." : `Save SEO for ${currentPresetConfig.label.split(" (")[0]}`}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-maroon-100 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-maroon-800 border-b border-maroon-100 pb-2.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-sm text-maroon-900">Google Search Preview</h3>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 font-sans">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-maroon-900 text-white flex items-center justify-center text-[10px] font-bold">
                  R
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold text-slate-800">{siteConfig.name}</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[260px]">{previewUrl}</p>
                </div>
              </div>

              <h4 className="text-sm font-medium text-blue-800 hover:underline cursor-pointer line-clamp-1 leading-snug">
                {previewTitle}
              </h4>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {previewDescription}
              </p>

              {currentNoIndex && (
                <div className="mt-2 text-[10px] font-bold uppercase text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded inline-block">
                  Page Marked as No-Index
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-maroon-100 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-maroon-800 border-b border-maroon-100 pb-2.5">
              <Share2 className="w-4 h-4 text-maroon-700" />
              <h3 className="font-serif font-bold text-sm text-maroon-900">Social Share Preview</h3>
            </div>

            <div className="rounded-xl border border-maroon-200/70 overflow-hidden bg-off-white shadow-2xs">
              <div className="aspect-[1.91/1] w-full bg-maroon-950/20 relative flex items-center justify-center overflow-hidden">
                {previewOgImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewOgImage}
                    alt="Social Card Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-maroon-400 flex flex-col items-center space-y-1">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[10px] font-medium">Default Site OG Image</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-maroon-600 tracking-wider">
                  commercecoreshop.vercel.app
                </span>
                <h4 className="text-xs font-bold text-maroon-900 line-clamp-1">
                  {previewTitle}
                </h4>
                <p className="text-[11px] text-maroon-700/80 line-clamp-2">
                  {previewDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-maroon-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
          <h3 className="font-serif font-bold text-base text-maroon-900 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            <span>Configured Page Overrides ({seoList.length})</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-xs text-maroon-600 animate-pulse">
            Loading SEO records...
          </div>
        ) : seoList.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-maroon-200 text-center text-xs text-maroon-600">
            No custom page overrides saved yet. Select a frontend page above to configure your first SEO meta entry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-maroon-900">
              <thead className="bg-off-white text-maroon-700 uppercase font-semibold text-[10px] tracking-wider border-b border-maroon-200">
                <tr>
                  <th className="px-4 py-2.5">Page / Route</th>
                  <th className="px-4 py-2.5">Title</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5">Indexing</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-100 font-sans">
                {seoList.map((entry) => {
                  const matchingRoute = AVAILABLE_FRONTEND_ROUTES.find((r) => r.route === entry.route);
                  return (
                    <tr key={entry.route} className="hover:bg-off-white/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-maroon-900">
                        <div className="flex items-center space-x-1.5">
                          <span>{matchingRoute ? matchingRoute.label : entry.route}</span>
                          <a
                            href={entry.route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-maroon-400 hover:text-maroon-800 inline-block ml-1"
                            title="Open page in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate font-medium">
                        {entry.title || <span className="text-maroon-400 italic">Default</span>}
                      </td>
                      <td className="px-4 py-3 max-w-[260px] truncate text-maroon-700">
                        {entry.description || <span className="text-maroon-400 italic">Default</span>}
                      </td>
                      <td className="px-4 py-3">
                        {entry.noIndex ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            noindex
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            indexed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditEntry(entry)}
                          className="px-2.5 py-1 bg-maroon-100 hover:bg-maroon-200 text-maroon-900 font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-1"
                          title="Edit SEO override"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-1"
                          title="Reset to default"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
