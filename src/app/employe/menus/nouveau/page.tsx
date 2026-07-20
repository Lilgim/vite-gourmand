import type { Metadata } from "next";
import { createMenu } from "@/app/actions/employee";
import {
  getAllDishes,
  getDietsWithIds,
  getThemesWithIds,
} from "@/lib/queries/employee";
import { MenuForm } from "../menu-form";

export const metadata: Metadata = { title: "Créer un menu" };

export default async function NouveauMenuPage() {
  const [themes, diets, dishes] = await Promise.all([
    getThemesWithIds(),
    getDietsWithIds(),
    getAllDishes(),
  ]);

  return (
    <div className="mt-6 max-w-2xl">
      <h1 className="text-2xl">Créer un menu</h1>
      <MenuForm
        action={createMenu}
        themes={themes}
        diets={diets}
        dishes={dishes}
        submitLabel="Créer le menu"
      />
    </div>
  );
}
