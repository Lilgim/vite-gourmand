import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createOrder } from "@/app/actions/orders";
import { OrderForm } from "@/components/order-form";
import { requireUser } from "@/lib/auth";
import { formatPrice, getMenuById } from "@/lib/queries/menus";

type CommanderPageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Commander" };

export default async function CommanderPage({ params }: CommanderPageProps) {
  const user = await requireUser();

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const menu = await getMenuById(id);
  if (!menu) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <nav aria-label="Fil d'Ariane" className="text-sm text-zinc-600">
        <Link href={`/menus/${menu.id}`} className="hover:underline">
          {menu.title}
        </Link>{" "}
        / <span aria-current="page">Commander</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold">Commander : {menu.title}</h1>
      <p className="mt-2 text-zinc-600">
        {formatPrice(menu.price_per_person)} par personne — minimum{" "}
        {menu.min_people} personnes.
      </p>

      {menu.stock > 0 ? (
        <OrderForm
          action={createOrder}
          hiddenFieldName="menu_id"
          hiddenFieldValue={menu.id}
          minPeople={menu.min_people}
          pricePerPerson={Number(menu.price_per_person)}
          defaults={{
            address: user.address ?? "",
            postalCode: user.postal_code ?? "",
            city: user.city ?? "",
            phone: user.phone ?? "",
          }}
          submitLabel="Valider ma commande"
          pendingLabel="Validation en cours…"
        />
      ) : (
        <p className="mt-6 rounded bg-amber-50 p-4 text-amber-900">
          Ce menu n'est plus disponible pour le moment.{" "}
          <Link href="/menus" className="underline">
            Voir les autres menus
          </Link>
        </p>
      )}
    </div>
  );
}
