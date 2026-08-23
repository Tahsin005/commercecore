import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site-config";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  updatedAt?: string;
  isActive?: boolean;
  seo?: {
    noIndex?: boolean;
  };
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
    // Fetch live products across all paginated pages
    const limit = 100;
    let page = 1;
    let hasNextPage = true;
    const allProducts: ApiProduct[] = [];

    while (hasNextPage) {
      const productsRes = await fetch(
        `${apiUrl}/products?limit=${limit}&page=${page}`,
        { next: { revalidate: 3600 } }
      ).catch(() => null);

      if (!productsRes || !productsRes.ok) break;

      const productsData = await productsRes.json().catch(() => null);
      const products: ApiProduct[] =
        productsData?.data?.products ||
        (Array.isArray(productsData?.data) ? productsData.data : []);

      allProducts.push(...products);

      hasNextPage = productsData?.data?.pagination?.hasNextPage === true;
      page += 1;
    }

    allProducts.forEach((product: ApiProduct) => {
      if (product && product.id && product.isActive !== false && product.seo?.noIndex !== true) {
        routes.push({
          url: `${baseUrl}/product/${product.id}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    });
  } catch {
    // Fallback gracefully to base static routes
  }

  return routes;
}
