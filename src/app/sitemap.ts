import type { MetadataRoute } from "next";
import { staticPages } from "@/lib/data/pages";
import { getAllBrandSlugs, getAllCategorySlugs, getAllProductSlugs } from "@/lib/repository";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brandSlugs, categorySlugs, productSlugs] = await Promise.all([
    getAllBrandSlugs(),
    getAllCategorySlugs(),
    getAllProductSlugs(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/marka`, changeFrequency: "weekly", priority: 0.8 },
    ...categorySlugs.map((slug) => ({
      url: `${site.url}/kategori/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...brandSlugs.map((slug) => ({
      url: `${site.url}/marka/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...productSlugs.map((slug) => ({
      url: `${site.url}/urun/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // Policy pages marked noindex have no business in the sitemap.
    ...Object.values(staticPages)
      .filter((page) => !page.noindex)
      .map((page) => ({
        url: `${site.url}/${page.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
    { url: `${site.url}/iletisim`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return entries;
}
