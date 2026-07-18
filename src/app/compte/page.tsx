import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { getOrdersForUser } from "@/lib/queries/orders";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Mon compte" };

export default async function ComptePage() {
  const user = await requireUser();
  const orders = await getOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Mon compte</h1>
      <p className="mt-1 text-zinc-600">{user.email}</p>

      <section aria-labelledby="titre-commandes" className="mt-8">
        <h2 id="titre-commandes" className="text-xl font-bold">
          Mes commandes
        </h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-zinc-600">
            Aucune commande pour le moment.{" "}
            <Link href="/menus" className="text-emerald-800 underline">
              Découvrir nos menus
            </Link>
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Historique de vos commandes</caption>
              <thead>
                <tr className="border-b border-zinc-300 text-left">
                  <th scope="col" className="py-2 pr-4">
                    Menu
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    Événement
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    Total
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    Statut
                  </th>
                  <th scope="col" className="py-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-200 last:border-0"
                  >
                    <td className="py-2 pr-4 font-medium">
                      {order.menu_title}
                    </td>
                    <td className="py-2 pr-4">
                      {new Date(order.event_date).toLocaleDateString("fr-FR")}
                      {" · "}
                      {order.people_count} pers.
                    </td>
                    <td className="py-2 pr-4">
                      {Number(order.total_price).toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      €
                    </td>
                    <td className="py-2 pr-4">
                      {ORDER_STATUS_LABELS[order.current_status] ??
                        order.current_status}
                    </td>
                    <td className="py-2">
                      <Link
                        href={`/compte/commandes/${order.id}`}
                        className="text-emerald-800 underline"
                      >
                        Détail
                        <span className="sr-only">
                          {" "}
                          de la commande n° {order.id}
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="titre-profil" className="mt-10">
        <h2 id="titre-profil" className="text-xl font-bold">
          Mes informations personnelles
        </h2>
        <ProfileForm
          defaults={{
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone ?? "",
            address: user.address ?? "",
            postal_code: user.postal_code ?? "",
            city: user.city ?? "",
          }}
        />
      </section>
    </div>
  );
}
