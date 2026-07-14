import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getOrderForUser,
  getOrderStatusHistory,
  getReviewForOrder,
  ORDER_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/queries/orders";
import { CancelButton } from "./cancel-button";
import { ReviewForm } from "./review-form";

type OrderPageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Ma commande" };

const euros = (value: string): string =>
  `${Number(value).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const user = await requireUser();

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  // La requête filtre sur user_id : un client ne voit que ses commandes.
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();

  const [history, review] = await Promise.all([
    getOrderStatusHistory(id),
    getReviewForOrder(id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <nav aria-label="Fil d'Ariane" className="text-sm text-zinc-600">
        <Link href="/compte" className="hover:underline">
          Mon compte
        </Link>{" "}
        / <span aria-current="page">Commande n° {order.id}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold">Commande n° {order.id}</h1>
      <p className="mt-2 rounded bg-emerald-50 px-3 py-2 font-medium text-emerald-900">
        {ORDER_STATUS_LABELS[order.current_status] ?? order.current_status}
      </p>

      {order.current_status === "submitted" && (
        <div className="mt-4 flex flex-col gap-3 rounded border border-zinc-200 p-4">
          <p className="text-sm text-zinc-700">
            Tant que la commande n'a pas été acceptée, vous pouvez la modifier
            (sauf le menu) ou l'annuler.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/compte/commandes/${order.id}/modifier`}
              className="rounded border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
            >
              Modifier la commande
            </Link>
            <CancelButton orderId={order.id} />
          </div>
        </div>
      )}

      <section aria-labelledby="titre-recap" className="mt-8">
        <h2 id="titre-recap" className="text-xl font-bold">
          Récapitulatif
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
            <dt className="text-zinc-600">Menu</dt>
            <dd className="font-medium">
              <Link href={`/menus/${order.menu_id}`} className="underline">
                {order.menu_title}
              </Link>
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
            <dt className="text-zinc-600">Convives</dt>
            <dd className="font-medium">{order.people_count} personnes</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
            <dt className="text-zinc-600">Date et heure</dt>
            <dd className="font-medium">
              {new Date(order.event_date).toLocaleDateString("fr-FR", {
                dateStyle: "long",
              })}{" "}
              à {order.event_time.slice(0, 5).replace(":", "h")}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
            <dt className="text-zinc-600">Lieu</dt>
            <dd className="text-right font-medium">
              {order.event_address}, {order.event_postal_code}{" "}
              {order.event_city}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-zinc-200 pb-2">
            <dt className="text-zinc-600">GSM</dt>
            <dd className="font-medium">{order.phone}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="titre-prix" className="mt-8">
        <h2 id="titre-prix" className="text-xl font-bold">
          Détail du prix
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>
              Menu ({euros(order.unit_price)} × {order.people_count})
            </dt>
            <dd>{euros(order.base_price)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Remise</dt>
            <dd>
              {Number(order.discount_amount) > 0
                ? `− ${euros(order.discount_amount)}`
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>
              Livraison
              {Number(order.distance_km) > 0
                ? ` (${Number(order.distance_km).toLocaleString("fr-FR")} km)`
                : ""}
            </dt>
            <dd>
              {Number(order.delivery_fee) > 0
                ? euros(order.delivery_fee)
                : "Offerte"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-zinc-300 pt-2 font-bold">
            <dt>Total</dt>
            <dd>{euros(order.total_price)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="titre-suivi" className="mt-8">
        <h2 id="titre-suivi" className="text-xl font-bold">
          Suivi de la commande
        </h2>
        <ol className="mt-3 space-y-3 border-l-2 border-emerald-200 pl-4">
          {history.map((entry) => (
            <li key={`${entry.status}-${entry.created_at}`} className="text-sm">
              <p className="font-medium">
                {ORDER_STATUS_LABELS[entry.status] ?? entry.status}
              </p>
              <p className="text-zinc-600">
                {formatDateTime(entry.created_at)}
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

      {order.current_status === "completed" && (
        <section aria-labelledby="titre-avis" className="mt-8">
          <h2 id="titre-avis" className="text-xl font-bold">
            Votre avis
          </h2>
          {review ? (
            <div className="mt-3 rounded border border-zinc-200 p-4 text-sm">
              <p aria-hidden="true" className="text-amber-500">
                {"★".repeat(review.rating)}
                <span className="text-zinc-300">
                  {"★".repeat(5 - review.rating)}
                </span>
              </p>
              <p className="sr-only">Note : {review.rating} sur 5</p>
              <p className="mt-2 text-zinc-700">{review.comment}</p>
              <p className="mt-2 font-medium text-zinc-600">
                {REVIEW_STATUS_LABELS[review.status]}
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="mb-3 text-sm text-zinc-600">
                Votre commande est terminée : partagez votre expérience ! Votre
                avis sera relu par notre équipe avant publication.
              </p>
              <ReviewForm orderId={order.id} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
