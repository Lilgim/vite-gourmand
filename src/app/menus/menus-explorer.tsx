"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MenuSummary } from "@/lib/queries/menus";

type MenusExplorerProps = {
  menus: MenuSummary[];
  themes: string[];
  diets: string[];
};

// Filtres combinables appliqués côté client : aucune navigation ni
// rechargement de page (exigence du sujet).
export const MenusExplorer = ({ menus, themes, diets }: MenusExplorerProps) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [theme, setTheme] = useState("");
  const [diet, setDiet] = useState("");
  const [people, setPeople] = useState("");

  const filtered = useMemo(
    () =>
      menus.filter((menu) => {
        if (minPrice && Number(menu.price_per_person) < Number(minPrice)) {
          return false;
        }
        if (maxPrice && Number(menu.price_per_person) > Number(maxPrice)) {
          return false;
        }
        if (theme && menu.theme !== theme) return false;
        if (diet && menu.diet !== diet) return false;
        if (people && Number(menu.min_people) > Number(people)) return false;
        return true;
      }),
    [menus, minPrice, maxPrice, theme, diet, people],
  );

  return (
    <>
      <form
        aria-label="Filtres des menus"
        className="mt-6 grid gap-4 rounded-[10px] border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filtre-prix-min"
            className="text-xs font-medium uppercase tracking-wider text-muted"
          >
            Prix minimum par personne (€)
          </label>
          <input
            id="filtre-prix-min"
            type="number"
            min="0"
            inputMode="numeric"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 focus:outline-2 focus:outline-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filtre-prix"
            className="text-xs font-medium uppercase tracking-wider text-muted"
          >
            Prix maximum par personne (€)
          </label>
          <input
            id="filtre-prix"
            type="number"
            min="0"
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 focus:outline-2 focus:outline-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filtre-theme"
            className="text-xs font-medium uppercase tracking-wider text-muted"
          >
            Thème
          </label>
          <select
            id="filtre-theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 focus:outline-2 focus:outline-primary"
          >
            <option value="">Tous les thèmes</option>
            {themes.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filtre-regime"
            className="text-xs font-medium uppercase tracking-wider text-muted"
          >
            Régime alimentaire
          </label>
          <select
            id="filtre-regime"
            value={diet}
            onChange={(event) => setDiet(event.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 focus:outline-2 focus:outline-primary"
          >
            <option value="">Tous les régimes</option>
            {diets.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filtre-personnes"
            className="text-xs font-medium uppercase tracking-wider text-muted"
          >
            Nombre de convives
          </label>
          <input
            id="filtre-personnes"
            type="number"
            min="1"
            inputMode="numeric"
            value={people}
            onChange={(event) => setPeople(event.target.value)}
            aria-describedby="aide-personnes"
            className="rounded-lg border border-line bg-white px-3 py-2 focus:outline-2 focus:outline-primary"
          />
          <p id="aide-personnes" className="text-xs text-muted">
            Affiche les menus accessibles pour ce nombre de personnes.
          </p>
        </div>
      </form>

      <p aria-live="polite" className="mt-4 text-sm text-muted">
        {filtered.length}{" "}
        {filtered.length > 1 ? "menus correspondent" : "menu correspond"} à
        votre recherche.
      </p>

      <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((menu) => (
          <li
            key={menu.id}
            className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-sm"
          >
            {menu.image_url && (
              // biome-ignore lint/performance/noImgElement: visuels SVG locaux légers
              <img
                src={menu.image_url}
                alt={menu.image_alt ?? ""}
                width={800}
                height={500}
                className="aspect-[8/5] w-full object-cover"
              />
            )}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h2 className="text-lg">{menu.title}</h2>
              <p className="text-sm text-muted">{menu.description}</p>
              <dl className="mt-auto grid grid-cols-2 gap-1 pt-2 text-sm">
                <dt className="text-muted">Thème</dt>
                <dd>{menu.theme}</dd>
                <dt className="text-muted">Régime</dt>
                <dd>{menu.diet}</dd>
                <dt className="text-muted">Minimum</dt>
                <dd>{menu.min_people} personnes</dd>
                <dt className="text-muted">Prix / personne</dt>
                <dd className="font-semibold text-primary">
                  {Number(menu.price_per_person).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </dd>
              </dl>
              <Link
                href={`/menus/${menu.id}`}
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-center font-medium text-white hover:bg-primary-dark"
              >
                Voir le menu<span className="sr-only"> {menu.title}</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-center text-muted">
          Aucun menu ne correspond à ces critères. Élargissez votre recherche ou
          contactez-nous pour une prestation sur mesure.
        </p>
      )}
    </>
  );
};
