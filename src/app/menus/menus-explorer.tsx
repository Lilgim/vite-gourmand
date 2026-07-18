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
  const [maxPrice, setMaxPrice] = useState("");
  const [theme, setTheme] = useState("");
  const [diet, setDiet] = useState("");
  const [people, setPeople] = useState("");

  const filtered = useMemo(
    () =>
      menus.filter((menu) => {
        if (maxPrice && Number(menu.price_per_person) > Number(maxPrice)) {
          return false;
        }
        if (theme && menu.theme !== theme) return false;
        if (diet && menu.diet !== diet) return false;
        if (people && Number(menu.min_people) > Number(people)) return false;
        return true;
      }),
    [menus, maxPrice, theme, diet, people],
  );

  return (
    <>
      <form
        aria-label="Filtres des menus"
        className="mt-6 grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="filtre-prix" className="text-sm font-medium">
            Prix maximum par personne (€)
          </label>
          <input
            id="filtre-prix"
            type="number"
            min="0"
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="rounded border border-zinc-300 bg-white px-3 py-2 focus:outline-2 focus:outline-emerald-700"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filtre-theme" className="text-sm font-medium">
            Thème
          </label>
          <select
            id="filtre-theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            className="rounded border border-zinc-300 bg-white px-3 py-2 focus:outline-2 focus:outline-emerald-700"
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
          <label htmlFor="filtre-regime" className="text-sm font-medium">
            Régime alimentaire
          </label>
          <select
            id="filtre-regime"
            value={diet}
            onChange={(event) => setDiet(event.target.value)}
            className="rounded border border-zinc-300 bg-white px-3 py-2 focus:outline-2 focus:outline-emerald-700"
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
          <label htmlFor="filtre-personnes" className="text-sm font-medium">
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
            className="rounded border border-zinc-300 bg-white px-3 py-2 focus:outline-2 focus:outline-emerald-700"
          />
          <p id="aide-personnes" className="text-xs text-zinc-600">
            Affiche les menus accessibles pour ce nombre de personnes.
          </p>
        </div>
      </form>

      <p aria-live="polite" className="mt-4 text-sm text-zinc-600">
        {filtered.length}{" "}
        {filtered.length > 1 ? "menus correspondent" : "menu correspond"} à
        votre recherche.
      </p>

      <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((menu) => (
          <li
            key={menu.id}
            className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
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
              <h2 className="text-lg font-bold">{menu.title}</h2>
              <p className="text-sm text-zinc-600">{menu.description}</p>
              <dl className="mt-auto grid grid-cols-2 gap-1 pt-2 text-sm">
                <dt className="text-zinc-500">Thème</dt>
                <dd>{menu.theme}</dd>
                <dt className="text-zinc-500">Régime</dt>
                <dd>{menu.diet}</dd>
                <dt className="text-zinc-500">Minimum</dt>
                <dd>{menu.min_people} personnes</dd>
                <dt className="text-zinc-500">Prix / personne</dt>
                <dd className="font-semibold">
                  {Number(menu.price_per_person).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </dd>
              </dl>
              <Link
                href={`/menus/${menu.id}`}
                className="mt-3 rounded bg-emerald-700 px-4 py-2 text-center font-medium text-white hover:bg-emerald-800"
              >
                Voir le menu<span className="sr-only"> {menu.title}</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-6 rounded border border-dashed border-zinc-300 p-6 text-center text-zinc-600">
          Aucun menu ne correspond à ces critères. Élargissez votre recherche ou
          contactez-nous pour une prestation sur mesure.
        </p>
      )}
    </>
  );
};
