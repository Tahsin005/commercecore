import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site-config";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  updatedAt?: string;
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  // Core static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    // Fetch live products
    const productsRes = await fetch(`${apiUrl}/products?limit=1000`, {
      next: { revalidate: 3600 },
    }).catch(() => null);

    if (productsRes && productsRes.ok) {
      const productsData = await productsRes.json().catch(() => null);
      const products: ApiProduct[] =
        productsData?.data?.products || (Array.isArray(productsData?.data) ? productsData.data : []);

      products.forEach((product) => {
        if (product && product.id) {
          routes.push({
            url: `${baseUrl}/product/${product.id}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      });
    }

    // Fetch live categories
    const categoriesRes = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 3600 },
    }).catch(() => null);

    if (categoriesRes && categoriesRes.ok) {
      const categoriesData = await categoriesRes.json().catch(() => null);
      const categories: ApiCategory[] = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

      categories.forEach((cat) => {
        if (cat && cat.id) {
          routes.push({
            url: `${baseUrl}/categories`,
            lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      });
    }
  } catch {
    // Fallback gracefully to base static routes
  }

  return routes;
}
