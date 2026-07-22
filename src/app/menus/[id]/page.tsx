import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import {
  formatPrice,
  getMenuById,
  getMenuDishes,
  getMenuImages,
} from "@/lib/queries/menus";
import { menuProductJsonLd } from "@/lib/structured-data";

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
      <JsonLd data={menuProductJsonLd(menu, images[0]?.url)} />
      <nav
        aria-label="Fil d'Ariane"
        className="text-xs uppercase tracking-widest text-muted"
      >
        <Link href="/menus" className="hover:underline">
          Nos menus
        </Link>{" "}
        / <span aria-current="page">{menu.title}</span>
      </nav>

      <h1 className="mt-4 text-3xl">{menu.title}</h1>
      <p className="mt-3 text-ink">{menu.description}</p>

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
                className="aspect-[8/5] w-full rounded-[10px] object-cover"
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <section aria-labelledby="titre-plats">
          <h2 id="titre-plats" className="text-xl">
            Les plats du menu
          </h2>
          <ul className="mt-3 space-y-3">
            {dishes.map((dish) => (
              <li
                key={dish.id}
                className="rounded-lg border border-line p-3 text-sm"
              >
                <p className="font-medium">{dish.name}</p>
                {dish.description && (
                  <p className="mt-1 text-muted">{dish.description}</p>
                )}
                {dish.allergens.length > 0 && (
                  <p className="mt-1 text-xs text-accent">
                    Allergènes : {dish.allergens.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titre-infos">
          <h2 id="titre-infos" className="text-xl">
            Informations pratiques
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-line pb-2">
              <dt className="text-muted">Thème</dt>
              <dd className="font-medium">{menu.theme}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-2">
              <dt className="text-muted">Régime alimentaire</dt>
              <dd className="font-medium">{menu.diet}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-2">
              <dt className="text-muted">Nombre minimum de personnes</dt>
              <dd className="font-medium">{menu.min_people}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-2">
              <dt className="text-muted">Prix par personne</dt>
              <dd className="font-medium">
                {formatPrice(menu.price_per_person)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-2">
              <dt className="text-muted">Allergènes présents</dt>
              <dd className="text-right font-medium">
                {allergens.length > 0 ? allergens.join(", ") : "Aucun signalé"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-2">
              <dt className="text-muted">Disponibilité</dt>
              <dd className="font-medium">
                {menu.stock > 0
                  ? `${menu.stock} prestations disponibles`
                  : "Épuisé actuellement"}
              </dd>
            </div>
          </dl>
          {menu.conditions && (
            <p className="mt-4 rounded-lg bg-surface p-3 text-sm text-ink">
              <strong>Conditions :</strong> {menu.conditions}
            </p>
          )}

          {menu.stock > 0 ? (
            <Link
              href={`/commander/${menu.id}`}
              className="mt-6 block rounded-lg bg-primary px-4 py-3 text-center font-medium text-white hover:bg-primary-dark"
            >
              Commander ce menu
            </Link>
          ) : (
            <p className="mt-6 rounded-lg bg-badge p-3 text-center text-sm text-ink">
              Menu épuisé pour le moment
            </p>
          )}
          <p className="mt-2 text-center text-xs text-muted">
            La commande nécessite un compte : vous serez invité à vous connecter
            si ce n'est pas déjà fait.
          </p>
        </section>
      </div>
    </div>
  );
}
