import type { Metadata } from "next";
import Link from "next/link";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { getOrdersForEmployee } from "@/lib/queries/employee";
import { ORDER_TRANSITIONS } from "@/lib/status";

export const metadata: Metadata = { title: "Commandes — Espace employé" };

type EmployePageProps = {
  searchParams: Promise<{ statut?: string; client?: string }>;
};

export default async function EmployeOrdersPage({
  searchParams,
}: EmployePageProps) {
  const params = await searchParams;
  const status =
    params.statut && params.statut in ORDER_TRANSITIONS
      ? params.statut
      : undefined;
  const clientSearch = params.client?.trim() || undefined;

  const orders = await getOrdersForEmployee(status, clientSearch);

  return (
    <div className="mt-6">
      <h1 className="text-2xl">Commandes</h1>

      <form
        method="get"
        className="mt-4 flex flex-wrap items-end gap-4 rounded-lg border border-line bg-surface p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="statut" className="text-[13px] font-medium text-ink">
            Statut
          </label>
          <select
            id="statut"
            name="statut"
            defaultValue={status ?? ""}
            className="rounded-lg border border-line bg-white px-3 py-2"
          >
            <option value="">Tous les statuts</option>
            {Object.keys(ORDER_TRANSITIONS).map((value) => (
              <option key={value} value={value}>
                {ORDER_STATUS_LABELS[value] ?? value}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="client" className="text-[13px] font-medium text-ink">
            Client (nom ou email)
          </label>
          <input
            id="client"
            name="client"
            defaultValue={clientSearch ?? ""}
            className="rounded-lg border border-line bg-white px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
        >
          Filtrer
        </button>
        <Link href="/employe" className="text-sm underline">
          Réinitialiser
        </Link>
      </form>

      <p className="mt-4 text-sm text-muted">
        {orders.length} commande{orders.length > 1 ? "s" : ""}
      </p>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Liste des commandes filtrées</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4">
                N°
              </th>
              <th scope="col" className="py-2 pr-4">
                Client
              </th>
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
              <tr key={order.id} className="border-b border-line last:border-0">
                <td className="py-2 pr-4">{order.id}</td>
                <td className="py-2 pr-4">
                  <span className="font-medium">{order.client_name}</span>
                  <br />
                  <span className="text-muted">{order.client_email}</span>
                </td>
                <td className="py-2 pr-4">{order.menu_title}</td>
                <td className="py-2 pr-4">
                  {new Date(order.event_date).toLocaleDateString("fr-FR")} ·{" "}
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
                    href={`/employe/commandes/${order.id}`}
                    className="text-primary underline"
                  >
                    Gérer
                    <span className="sr-only"> la commande n° {order.id}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="mt-4 rounded-lg border border-dashed border-line p-4 text-center text-muted">
            Aucune commande ne correspond à ces filtres.
          </p>
        )}
      </div>
    </div>
  );
}
