import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateOrder } from "@/app/actions/account";
import { OrderForm } from "@/components/order-form";
import { requireUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { getOrderForUser } from "@/lib/queries/orders";

type ModifierPageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Modifier ma commande" };

export default async function ModifierCommandePage({
  params,
}: ModifierPageProps) {
  const user = await requireUser();

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();

  // Modification possible uniquement avant acceptation (règle du sujet).
  if (order.current_status !== "submitted") {
    redirect(`/compte/commandes/${id}`);
  }

  const menu = await queryOne<{ min_people: number }>(
    "SELECT min_people FROM menus WHERE id = $1",
    [order.menu_id],
  );
  if (!menu) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <nav
        aria-label="Fil d'Ariane"
        className="text-xs uppercase tracking-widest text-muted"
      >
        <Link href={`/compte/commandes/${id}`} className="hover:underline">
          Commande n° {id}
        </Link>{" "}
        / <span aria-current="page">Modifier</span>
      </nav>

      <h1 className="mt-4 text-3xl">Modifier ma commande</h1>
      <p className="mt-2 rounded-lg bg-surface p-3 text-sm text-ink">
        Le menu (<strong>{order.menu_title}</strong>) ne peut pas être changé :
        pour un autre menu, annulez cette commande puis passez-en une nouvelle.
      </p>

      <OrderForm
        action={updateOrder}
        hiddenFieldName="order_id"
        hiddenFieldValue={order.id}
        minPeople={menu.min_people}
        pricePerPerson={Number(order.unit_price)}
        defaults={{
          peopleCount: order.people_count,
          eventDate: order.event_date,
          eventTime: order.event_time.slice(0, 5),
          address: order.event_address,
          postalCode: order.event_postal_code,
          city: order.event_city,
          phone: order.phone,
          distanceKm: Number(order.distance_km),
        }}
        submitLabel="Enregistrer les modifications"
        pendingLabel="Enregistrement…"
      />
    </div>
  );
}
