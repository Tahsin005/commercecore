import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site-config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/categories", "/product/"],
        disallow: [
          "/admin",
          "/admin/*",
          "/profile",
          "/profile/*",
          "/checkout",
          "/checkout/*",
          "/order-success",
          "/order-success/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
