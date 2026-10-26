import "server-only";
import { cache } from "react";
import { query, queryOne } from "@/lib/db";

export type MenuSummary = {
  id: number;
  title: string;
  description: string;
  theme: string;
  diet: string;
  min_people: number;
  price_per_person: string;
  stock: number;
  image_url: string | null;
  image_alt: string | null;
  allergens: string[];
};

// Liste des menus actifs avec tout ce qu'il faut pour filtrer côté client.
export const getActiveMenus = (): Promise<MenuSummary[]> =>
  query<MenuSummary>(
    `SELECT m.id, m.title, m.description, t.name AS theme, d.name AS diet,
            m.min_people, m.price_per_person::text, m.stock,
            img.url AS image_url, img.alt AS image_alt,
            COALESCE(alg.names, '{}') AS allergens
       FROM menus m
       JOIN themes t ON t.id = m.theme_id
       JOIN diets d  ON d.id = m.diet_id
       LEFT JOIN LATERAL (
         SELECT url, alt FROM menu_images
          WHERE menu_id = m.id ORDER BY position LIMIT 1
       ) img ON TRUE
       LEFT JOIN LATERAL (
         SELECT array_agg(DISTINCT a.name ORDER BY a.name) AS names
           FROM menu_dishes md
           JOIN dish_allergens da ON da.dish_id = md.dish_id
           JOIN allergens a ON a.id = da.allergen_id
          WHERE md.menu_id = m.id
       ) alg ON TRUE
      WHERE m.is_active
      ORDER BY m.title`,
  );

export type MenuDish = {
  id: number;
  name: string;
  description: string | null;
  allergens: string[];
};

export type MenuImage = { url: string; alt: string };

export type MenuDetail = {
  id: number;
  title: string;
  description: string;
  theme: string;
  diet: string;
  min_people: number;
  price_per_person: string;
  conditions: string | null;
  stock: number;
};

// Mémoïsé par requête : generateMetadata et la page demandent le même menu.
export const getMenuById = cache(
  (id: number): Promise<MenuDetail | null> =>
    queryOne<MenuDetail>(
      `SELECT m.id, m.title, m.description, t.name AS theme, d.name AS diet,
            m.min_people, m.price_per_person::text, m.conditions, m.stock
       FROM menus m
       JOIN themes t ON t.id = m.theme_id
       JOIN diets d  ON d.id = m.diet_id
      WHERE m.id = $1 AND m.is_active`,
      [id],
    ),
);

export const getMenuDishes = (menuId: number): Promise<MenuDish[]> =>
  query<MenuDish>(
    `SELECT di.id, di.name, di.description,
            COALESCE(array_agg(a.name ORDER BY a.name)
                     FILTER (WHERE a.id IS NOT NULL), '{}') AS allergens
       FROM menu_dishes md
       JOIN dishes di ON di.id = md.dish_id
       LEFT JOIN dish_allergens da ON da.dish_id = di.id
       LEFT JOIN allergens a ON a.id = da.allergen_id
      WHERE md.menu_id = $1
      GROUP BY di.id, di.name, di.description
      ORDER BY di.id`,
    [menuId],
  );

export const getMenuImages = (menuId: number): Promise<MenuImage[]> =>
  query<MenuImage>(
    "SELECT url, alt FROM menu_images WHERE menu_id = $1 ORDER BY position",
    [menuId],
  );

// Identifiants des menus actifs, pour le sitemap (requête légère).
export const getPublicMenuIds = (): Promise<{ id: number }[]> =>
  query<{ id: number }>("SELECT id FROM menus WHERE is_active ORDER BY id");

export const getThemes = (): Promise<{ name: string }[]> =>
  query<{ name: string }>("SELECT name FROM themes ORDER BY name");

export const getDiets = (): Promise<{ name: string }[]> =>
  query<{ name: string }>("SELECT name FROM diets ORDER BY name");

export const formatPrice = (price: string): string =>
  `${Number(price).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
