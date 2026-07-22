import type { MetadataRoute } from "next";
import { getPublicMenuIds } from "@/lib/queries/menus";

const baseUrl = (
  process.env.APP_URL ?? "https://vite-gourmand.lilgim.cloud"
).replace(/\/$/, "");

const STATIC_PATHS = [
  "",
  "/menus",
  "/entreprise",
  "/contact",
  "/mentions-legales",
  "/cgv",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Une entrée par fiche menu active. En cas de base indisponible (build
  // hors ligne), on retombe proprement sur les pages statiques.
  let menuEntries: MetadataRoute.Sitemap = [];
  try {
    const menus = await getPublicMenuIds();
    menuEntries = menus.map((menu) => ({
      url: `${baseUrl}/menus/${menu.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap : liste des menus indisponible :", error);
  }

  return [...staticEntries, ...menuEntries];
}
