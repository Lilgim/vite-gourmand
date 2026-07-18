import type { Metadata } from "next";
import { getMenuStats } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Statistiques" };

type AdminPageProps = {
  searchParams: Promise<{ du?: string; au?: string }>;
};

const parseDate = (value?: string): Date | undefined => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const euros = (value: number): string =>
  `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;

export default async function AdminStatsPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const from = parseDate(params.du);
  const toDay = parseDate(params.au);
  // Borne haute inclusive : fin de journée.
  const to = toDay
    ? new Date(toDay.getTime() + 24 * 60 * 60 * 1000 - 1)
    : undefined;

  const stats = await getMenuStats(from, to);
  const totalOrders = stats.reduce((sum, stat) => sum + stat.orders, 0);
  const totalRevenue =
    Math.round(stats.reduce((sum, stat) => sum + stat.revenue, 0) * 100) / 100;
  const maxOrders = Math.max(1, ...stats.map((stat) => stat.orders));

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold">Statistiques</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Données issues de la base NoSQL (MongoDB), hors commandes annulées.
      </p>

      <form
        method="get"
        className="mt-4 flex flex-wrap items-end gap-4 rounded border border-zinc-200 bg-zinc-50 p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="du" className="text-sm font-medium">
            Du
          </label>
          <input
            id="du"
            name="du"
            type="date"
            defaultValue={params.du ?? ""}
            className="rounded border border-zinc-300 bg-white px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="au" className="text-sm font-medium">
            Au
          </label>
          <input
            id="au"
            name="au"
            type="date"
            defaultValue={params.au ?? ""}
            className="rounded border border-zinc-300 bg-white px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
        >
          Filtrer la période
        </button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">Commandes sur la période</p>
          <p className="mt-1 text-3xl font-bold">{totalOrders}</p>
        </div>
        <div className="rounded border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">
            Chiffre d'affaires sur la période
          </p>
          <p className="mt-1 text-3xl font-bold">{euros(totalRevenue)}</p>
        </div>
      </div>

      <section aria-labelledby="titre-comparaison" className="mt-8">
        <h2 id="titre-comparaison" className="text-xl font-bold">
          Commandes par menu
        </h2>
        {stats.length === 0 ? (
          <p className="mt-3 rounded border border-dashed border-zinc-300 p-4 text-center text-zinc-600">
            Aucune commande sur cette période.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {stats.map((stat) => (
              <li key={stat.menuId}>
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-medium">{stat.menuTitle}</span>
                  <span className="text-zinc-600">
                    {stat.orders} commande{stat.orders > 1 ? "s" : ""} ·{" "}
                    {euros(stat.revenue)}
                  </span>
                </div>
                {/* Comparaison graphique : barre proportionnelle au volume */}
                <div
                  role="img"
                  aria-label={`${stat.menuTitle} : ${stat.orders} commandes sur ${maxOrders} au maximum`}
                  className="mt-1 h-5 w-full rounded bg-zinc-100"
                >
                  <div
                    className="h-5 rounded bg-emerald-600"
                    style={{ width: `${(stat.orders / maxOrders) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titre-table" className="mt-8">
        <h2 id="titre-table" className="text-xl font-bold">
          Détail chiffré
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full max-w-xl border-collapse text-sm">
            <caption className="sr-only">
              Commandes et chiffre d'affaires par menu
            </caption>
            <thead>
              <tr className="border-b border-zinc-300 text-left">
                <th scope="col" className="py-2 pr-4">
                  Menu
                </th>
                <th scope="col" className="py-2 pr-4">
                  Commandes
                </th>
                <th scope="col" className="py-2">
                  Chiffre d'affaires
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr
                  key={stat.menuId}
                  className="border-b border-zinc-200 last:border-0"
                >
                  <td className="py-2 pr-4 font-medium">{stat.menuTitle}</td>
                  <td className="py-2 pr-4">{stat.orders}</td>
                  <td className="py-2">{euros(stat.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
