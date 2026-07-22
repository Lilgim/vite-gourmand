import type { MetadataRoute } from "next";

const baseUrl = (
  process.env.APP_URL ?? "https://vite-gourmand.lilgim.cloud"
).replace(/\/$/, "");

// Les espaces authentifiés ne doivent jamais être explorés ni indexés.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/employe", "/compte", "/commander"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
