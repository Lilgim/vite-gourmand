import Link from "next/link";
import {
  DAY_NAMES,
  formatTime,
  getApprovedReviews,
  getOpeningHours,
} from "@/lib/queries/home";

export default async function HomePage() {
  const [reviews, hours] = await Promise.all([
    getApprovedReviews(),
    getOpeningHours(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Héros */}
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold text-emerald-900 sm:text-5xl">
          Le traiteur bordelais de vos grands moments
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
          Mariages, anniversaires, événements d'entreprise : Vite &amp; Gourmand
          compose des menus généreux avec des produits du Sud-Ouest, livrés
          partout dans la métropole bordelaise.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/menus"
            className="rounded bg-emerald-700 px-6 py-3 font-medium text-white hover:bg-emerald-800"
          >
            Découvrir nos menus
          </Link>
          <Link
            href="/entreprise"
            className="rounded border border-emerald-700 px-6 py-3 font-medium text-emerald-800 hover:bg-emerald-50"
          >
            Notre histoire
          </Link>
        </div>
      </section>

      {/* Avis validés */}
      <section aria-labelledby="titre-avis" className="py-12">
        <h2 id="titre-avis" className="text-2xl font-bold">
          Ils nous ont fait confiance
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-zinc-600">
            Aucun avis publié pour le moment.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <p className="text-amber-500">
                  <span aria-hidden="true">
                    {"★".repeat(review.rating)}
                    <span className="text-zinc-300">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </span>
                  <span className="sr-only">Note : {review.rating} sur 5</span>
                </p>
                <p className="mt-2 text-sm text-zinc-700">{review.comment}</p>
                <p className="mt-3 text-sm font-medium">{review.first_name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Horaires */}
      <section aria-labelledby="titre-horaires" className="py-12">
        <h2 id="titre-horaires" className="text-2xl font-bold">
          Nos horaires
        </h2>
        <table className="mt-6 w-full max-w-md border-collapse text-sm">
          <caption className="sr-only">
            Horaires d'ouverture de la boutique
          </caption>
          <tbody>
            {hours.map((hour) => (
              <tr
                key={hour.day_of_week}
                className="border-b border-zinc-200 last:border-0"
              >
                <th scope="row" className="py-2 text-left font-medium">
                  {DAY_NAMES[hour.day_of_week]}
                </th>
                <td className="py-2 text-right">
                  {hour.is_closed
                    ? "Fermé"
                    : `${formatTime(hour.open_time)} – ${formatTime(hour.close_time)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
