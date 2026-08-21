import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { siteConfig } from "@/lib/seo/site-config";
import { JsonLd } from "@/components/seo/JsonLd";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { fetchRouteSeo, constructMetadata } from "@/lib/seo/seo-fetcher";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchRouteSeo("/");
  const baseMeta = constructMetadata({
    seo,
    route: "/",
  });

  return {
    ...baseMeta,
    title: {
      default: (baseMeta.title as string) || `${siteConfig.name} | ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    applicationName: siteConfig.name,
    category: siteConfig.category,
    icons: {
      icon: [
        { url: "/logo.png", type: "image/png" },
        { url: "/icon.png", type: "image/png" },
      ],
      shortcut: "/logo.png",
      apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    telephone: siteConfig.contact.telephone,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "BD",
    },
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["en-US", "bn-BD"],
  };

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        <JsonLd data={[organizationSchema, webSiteSchema]} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
