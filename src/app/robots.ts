import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Faceted and per-visitor URLs multiply without adding unique content.
        disallow: ["/sepet", "/hesap", "/arama", "/*?siralama=", "/*?gorunum="],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
