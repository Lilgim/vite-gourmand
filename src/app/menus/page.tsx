import type { Metadata } from "next";
import { getActiveMenus, getDiets, getThemes } from "@/lib/queries/menus";
import { MenusExplorer } from "./menus-explorer";

export const metadata: Metadata = {
  title: "Nos menus",
  description:
    "Tous les menus traiteur de Vite & Gourmand : mariage, anniversaire, entreprise, végétarien, végan. Filtrez par prix, thème, régime et nombre de convives.",
};

export default async function MenusPage() {
  const [menus, themes, diets] = await Promise.all([
    getActiveMenus(),
    getThemes(),
    getDiets(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl">Nos menus</h1>
      <p className="mt-2 text-muted">
        Filtrez par prix, thème, régime alimentaire ou nombre de convives — la
        liste se met à jour instantanément.
      </p>
      <MenusExplorer
        menus={menus}
        themes={themes.map((t) => t.name)}
        diets={diets.map((d) => d.name)}
      />
    </div>
  );
}
