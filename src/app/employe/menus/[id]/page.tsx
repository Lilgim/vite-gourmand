import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateMenu } from "@/app/actions/employee";
import {
  getAllDishes,
  getDietsWithIds,
  getMenuForEdit,
  getThemesWithIds,
} from "@/lib/queries/employee";
import { MenuForm } from "../menu-form";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Modifier un menu" };

export default async function ModifierMenuPage({ params }: PageProps) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [menu, themes, diets, dishes] = await Promise.all([
    getMenuForEdit(id),
    getThemesWithIds(),
    getDietsWithIds(),
    getAllDishes(),
  ]);
  if (!menu) notFound();

  return (
    <div className="mt-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Modifier : {menu.title}</h1>
      <MenuForm
        action={updateMenu}
        themes={themes}
        diets={diets}
        dishes={dishes}
        defaults={{
          menuId: menu.id,
          title: menu.title,
          description: menu.description,
          theme_id: menu.theme_id,
          diet_id: menu.diet_id,
          min_people: menu.min_people,
          price_per_person: menu.price_per_person,
          conditions: menu.conditions ?? "",
          stock: menu.stock,
          dish_ids: menu.dish_ids,
          images_text: menu.images_text,
        }}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
