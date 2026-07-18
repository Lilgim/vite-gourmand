import type { Metadata } from "next";
import { getAllDishes, getAllergensWithIds } from "@/lib/queries/employee";
import { DishForm } from "./dish-form";

export const metadata: Metadata = { title: "Plats — Espace employé" };

export default async function EmployePlatsPage() {
  const [dishes, allergens] = await Promise.all([
    getAllDishes(),
    getAllergensWithIds(),
  ]);

  const allergenNames = new Map(allergens.map((a) => [a.id, a.name]));

  return (
    <div className="mt-6">
      <h1 className="text-2xl">Plats</h1>

      <section
        aria-labelledby="titre-nouveau-plat"
        className="mt-4 max-w-xl rounded-lg border border-line bg-surface p-4"
      >
        <h2 id="titre-nouveau-plat" className="text-lg">
          Créer un plat
        </h2>
        <DishForm allergens={allergens} />
      </section>

      <section aria-labelledby="titre-liste-plats" className="mt-8">
        <h2 id="titre-liste-plats" className="text-lg">
          Plats existants ({dishes.length})
        </h2>
        <ul className="mt-3 grid gap-4 lg:grid-cols-2">
          {dishes.map((dish) => (
            <li key={dish.id} className="rounded-lg border border-line p-4">
              <details>
                <summary className="cursor-pointer font-medium">
                  {dish.name}
                  <span className="ml-2 text-xs text-muted">
                    {dish.menu_count > 0
                      ? `${dish.menu_count} menu(s)`
                      : "non utilisé"}
                    {dish.allergen_ids.length > 0 &&
                      ` · allergènes : ${dish.allergen_ids
                        .map((id) => allergenNames.get(id))
                        .filter(Boolean)
                        .join(", ")}`}
                  </span>
                </summary>
                <div className="mt-3">
                  <DishForm
                    allergens={allergens}
                    defaults={{
                      dishId: dish.id,
                      name: dish.name,
                      description: dish.description ?? "",
                      allergen_ids: dish.allergen_ids,
                      menuCount: dish.menu_count,
                    }}
                  />
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
