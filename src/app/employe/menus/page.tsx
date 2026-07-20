import type { Metadata } from "next";
import Link from "next/link";
import { getAllMenus } from "@/lib/queries/employee";
import { ToggleMenuButton } from "./toggle-menu-button";

export const metadata: Metadata = { title: "Menus — Espace employé" };

export default async function EmployeMenusPage() {
  const menus = await getAllMenus();

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl">Menus</h1>
        <Link
          href="/employe/menus/nouveau"
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
        >
          Créer un menu
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Tous les menus, actifs ou non</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4">
                Titre
              </th>
              <th scope="col" className="py-2 pr-4">
                Thème / Régime
              </th>
              <th scope="col" className="py-2 pr-4">
                Min. / Prix
              </th>
              <th scope="col" className="py-2 pr-4">
                Stock
              </th>
              <th scope="col" className="py-2 pr-4">
                Visible
              </th>
              <th scope="col" className="py-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {menus.map((menu) => (
              <tr key={menu.id} className="border-b border-line last:border-0">
                <td className="py-2 pr-4 font-medium">{menu.title}</td>
                <td className="py-2 pr-4">
                  {menu.theme} · {menu.diet}
                </td>
                <td className="py-2 pr-4">
                  {menu.min_people} pers. ·{" "}
                  {Number(menu.price_per_person).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  €
                </td>
                <td className="py-2 pr-4">{menu.stock}</td>
                <td className="py-2 pr-4">{menu.is_active ? "Oui" : "Non"}</td>
                <td className="flex gap-3 py-2">
                  <Link
                    href={`/employe/menus/${menu.id}`}
                    className="text-primary underline"
                  >
                    Modifier
                    <span className="sr-only"> le menu {menu.title}</span>
                  </Link>
                  <ToggleMenuButton
                    menuId={menu.id}
                    isActive={menu.is_active}
                    title={menu.title}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
