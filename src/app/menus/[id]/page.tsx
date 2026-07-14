import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPrice,
  getMenuById,
  getMenuDishes,
  getMenuImages,
} from "@/lib/queries/menus";

type MenuPageProps = { params: Promise<{ id: string }> };

const parseId = (raw: string): number | null => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function generateMetadata({
  params,
}: MenuPageProps): Promise<Metadata> {
  const id = parseId((await params).id);
  const menu = id ? await getMenuById(id) : null;
  return { title: menu ? menu.title : "Menu introuvable" };
}

export default async function MenuDetailPage({ params }: MenuPageProps) {
  const id = parseId((await params).id);
  if (!id) notFound();

  const menu = await getMenuById(id);
  if (!menu) notFound();

  const [dishes, images] = await Promise.all([
    getMenuDishes(id),
    getMenuImages(id),
  ]);

  const allergens = [...new Set(dishes.flatMap((dish) => dish.allergens))];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav aria-label="Fil d'Ariane" className="text-sm text-zinc-600">
        <Link href="/menus" className="hover:underline">
          Nos menus
        </Link>{" "}
        / <span aria-current="page">{menu.title}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold">{menu.title}</h1>
      <p className="mt-3 text-zinc-700">{menu.description}</p>

      {images.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {images.map((image) => (
            <li key={image.url}>
              {/* biome-ignore lint/performance/noImgElement: visuels SVG locaux légers */}
              <img
                src={image.url}
                alt={image.alt}
                width={800}
                height={500}
                className="aspect-[8/5] w-full rounded-lg object-cover"
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <section aria-labelledby="titre-plats">
          <h2 id="titre-plats" className="text-xl font-bold">
            Les plats du menu
          </h2>
          <ul className="mt-3 space-y-3">
            {dishes.map((dish) => (
              <li
                key={dish.id}
                className="rounded border border-zinc-200 p-3 text-sm"
              >
                <p className="font-medium">{dish.name}</p>
                {dish.description && (
                  <p className="mt-1 text-zinc-600">{dish.description}</p>
                )}
                {dish.allergens.length > 0 && (
                  <p className="mt-1 text-xs text-amber-800">
                    Allergènes : {dish.allergens.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titre-infos">
          <h2 id="titre-infos" className="text-xl font-bold">
            Informations pratiques
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Thème</dt>
              <dd className="font-medium">{menu.theme}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Régime alimentaire</dt>
              <dd className="font-medium">{menu.diet}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Nombre minimum de personnes</dt>
              <dd className="font-medium">{menu.min_people}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Prix par personne</dt>
              <dd className="font-medium">
                {formatPrice(menu.price_per_person)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Allergènes présents</dt>
              <dd className="text-right font-medium">
                {allergens.length > 0 ? allergens.join(", ") : "Aucun signalé"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Disponibilité</dt>
              <dd className="font-medium">
                {menu.stock > 0
                  ? `${menu.stock} prestations disponibles`
                  : "Épuisé actuellement"}
              </dd>
            </div>
          </dl>
          {menu.conditions && (
            <p className="mt-4 rounded bg-zinc-50 p-3 text-sm text-zinc-700">
              <strong>Conditions :</strong> {menu.conditions}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
