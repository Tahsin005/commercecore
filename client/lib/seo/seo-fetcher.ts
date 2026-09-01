import { Metadata } from "next";
import { siteConfig } from "./site-config";
import { SeoMetaItem } from "@/lib/validations/seo";

export async function fetchRouteSeo(route: string): Promise<SeoMetaItem | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  const normalizedRoute = route.startsWith("/") ? route.toLowerCase() : `/${route.toLowerCase()}`;

  try {
    const res = await fetch(
      `${apiUrl}/seo?route=${encodeURIComponent(normalizedRoute)}`,
      {
        next: { revalidate: 3600 }, // 1 hour ISR revalidation
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    // Fallback gracefully without breaking SSR
    return null;
  }
}

export function constructMetadata({
  seo,
  route = "/",
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
}: {
  seo?: SeoMetaItem | null;
  route?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackImage?: string;
}): Metadata {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const canonicalUrl = seo?.canonicalUrl || `${baseUrl}${route === "/" ? "" : route}`;

  const title = seo?.title || fallbackTitle || `${siteConfig.name} | ${siteConfig.tagline}`;
  const description = seo?.description || fallbackDescription || siteConfig.description;
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage || fallbackImage || siteConfig.ogImage;
  const isNoIndex = seo?.noIndex === true;
  const keywords = seo?.keywords && seo.keywords.length > 0 ? seo.keywords : siteConfig.keywords;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isNoIndex
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      alternateLocale: siteConfig.localeAlternate,
      url: canonicalUrl,
      title: ogTitle,
      description: ogDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
      creator: "@commercecore",
    },
  };
}
