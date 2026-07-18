import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import { getOrderForEmployee } from "@/lib/queries/employee";
import { getOrderStatusHistory } from "@/lib/queries/orders";
import { isOrderStatus } from "@/lib/status";
import { StatusActions } from "./status-actions";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Gestion de commande" };

const euros = (value: string): string =>
  `${Number(value).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;

export default async function EmployeOrderPage({ params }: PageProps) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const order = await getOrderForEmployee(id);
  if (!order) notFound();

  const history = await getOrderStatusHistory(id);

  return (
    <div className="mt-6">
      <nav aria-label="Fil d'Ariane" className="text-sm text-zinc-600">
        <Link href="/employe" className="hover:underline">
          Commandes
        </Link>{" "}
        / <span aria-current="page">Commande n° {order.id}</span>
      </nav>

      <h1 className="mt-2 text-2xl font-bold">
        Commande n° {order.id} — {order.client_name}
      </h1>
      <p className="mt-2 inline-block rounded bg-emerald-50 px-3 py-1.5 font-medium text-emerald-900">
        {ORDER_STATUS_LABELS[order.current_status] ?? order.current_status}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="titre-infos-commande">
          <h2 id="titre-infos-commande" className="text-lg font-bold">
            Détails
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Client</dt>
              <dd className="text-right font-medium">
                {order.client_name}
                <br />
                {order.client_email}
                {order.client_phone && (
                  <>
                    <br />
                    {order.client_phone}
                  </>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Menu</dt>
              <dd className="font-medium">{order.menu_title}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Convives</dt>
              <dd className="font-medium">{order.people_count}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">Événement</dt>
              <dd className="text-right font-medium">
                {new Date(order.event_date).toLocaleDateString("fr-FR", {
                  dateStyle: "long",
                })}{" "}
                à {order.event_time.slice(0, 5).replace(":", "h")}
                <br />
                {order.event_address}, {order.event_postal_code}{" "}
                {order.event_city}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">GSM jour J</dt>
              <dd className="font-medium">{order.phone}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
              <dt className="text-zinc-600">
                Total (livraison{" "}
                {Number(order.delivery_fee) > 0
                  ? euros(order.delivery_fee)
                  : "offerte"}
                , remise{" "}
                {Number(order.discount_amount) > 0
                  ? euros(order.discount_amount)
                  : "—"}
                )
              </dt>
              <dd className="font-bold">{euros(order.total_price)}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="titre-actions">
          <h2 id="titre-actions" className="text-lg font-bold">
            Faire progresser la commande
          </h2>
          <div className="mt-3">
            {isOrderStatus(order.current_status) ? (
              <StatusActions
                orderId={order.id}
                currentStatus={order.current_status}
              />
            ) : (
              <p className="text-sm text-red-700">Statut inconnu.</p>
            )}
          </div>

          <h2 className="mt-8 text-lg font-bold">Historique</h2>
          <ol className="mt-3 space-y-3 border-l-2 border-emerald-200 pl-4">
            {history.map((entry) => (
              <li
                key={`${entry.status}-${entry.created_at}`}
                className="text-sm"
              >
                <p className="font-medium">
                  {ORDER_STATUS_LABELS[entry.status] ?? entry.status}
                </p>
                <p className="text-zinc-600">
                  {new Date(entry.created_at).toLocaleString("fr-FR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
                {entry.reason && (
                  <p className="text-zinc-600">
                    Motif : {entry.reason}
                    {entry.contact_mode && ` (contact : ${entry.contact_mode})`}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
