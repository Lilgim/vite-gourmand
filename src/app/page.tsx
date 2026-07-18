import Link from "next/link";
import { DAY_NAMES, formatTime } from "@/lib/labels";
import { getApprovedReviews, getOpeningHours } from "@/lib/queries/home";

export default async function HomePage() {
  const [reviews, hours] = await Promise.all([
    getApprovedReviews(),
    getOpeningHours(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Héros */}
      <section className="py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Traiteur à Bordeaux depuis 2015
        </p>
        <h1 className="mt-4 text-4xl text-ink sm:text-5xl">
          Le traiteur bordelais de vos grands moments
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Mariages, anniversaires, événements d'entreprise : Vite &amp; Gourmand
          compose des menus généreux avec des produits du Sud-Ouest, livrés
          partout dans la métropole bordelaise.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/menus"
            className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-dark"
          >
            Découvrir nos menus
          </Link>
          <Link
            href="/entreprise"
            className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-bg"
          >
            Notre histoire
          </Link>
        </div>
      </section>

      {/* Avis validés */}
      <section aria-labelledby="titre-avis" className="py-12">
        <h2 id="titre-avis" className="text-2xl">
          Ils nous ont fait confiance
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-muted">Aucun avis publié pour le moment.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-[10px] border border-line bg-surface p-4 shadow-sm"
              >
                <p className="text-primary">
                  <span aria-hidden="true">
                    {"★".repeat(review.rating)}
                    <span className="text-line">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </span>
                  <span className="sr-only">Note : {review.rating} sur 5</span>
                </p>
                <p className="mt-2 font-display text-sm italic text-ink">
                  {review.comment}
                </p>
                <p className="mt-3 text-sm font-medium">{review.first_name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Horaires */}
      <section aria-labelledby="titre-horaires" className="py-12">
        <h2 id="titre-horaires" className="text-2xl">
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
                className="border-b border-line last:border-0"
              >
                <th scope="row" className="py-2 text-left font-medium">
                  {DAY_NAMES[hour.day_of_week]}
                </th>
                <td className="py-2 text-right">
                  {hour.is_closed ? (
                    <span className="font-medium text-primary">Fermé</span>
                  ) : (
                    `${formatTime(hour.open_time)} – ${formatTime(hour.close_time)}`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
