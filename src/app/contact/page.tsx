import type { Metadata } from "next";
import { DAY_NAMES, formatTime } from "@/lib/labels";
import { getOpeningHours } from "@/lib/queries/home";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Vite & Gourmand : adresse, téléphone, email et horaires de la boutique à Bordeaux.",
};

export default async function ContactPage() {
  const hours = await getOpeningHours();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Nous contacter</h1>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <section aria-labelledby="titre-coordonnees">
          <h2 id="titre-coordonnees" className="text-xl font-bold">
            Coordonnées
          </h2>
          <address className="mt-3 space-y-2 text-zinc-700 not-italic">
            <p>
              Vite &amp; Gourmand
              <br />
              18 rue des Faussets
              <br />
              33000 Bordeaux
            </p>
            <p>
              Téléphone :{" "}
              <a href="tel:+33556000000" className="text-emerald-800 underline">
                05 56 00 00 00
              </a>
            </p>
            <p>
              Email :{" "}
              <a
                href="mailto:contact@vite-gourmand.example"
                className="text-emerald-800 underline"
              >
                contact@vite-gourmand.example
              </a>
            </p>
          </address>
          <p className="mt-4 text-sm text-zinc-600">
            Pour une demande de devis ou une question sur un menu, appelez-nous
            ou écrivez-nous : nous répondons sous 24 h ouvrées.
          </p>
        </section>

        <section aria-labelledby="titre-horaires-contact">
          <h2 id="titre-horaires-contact" className="text-xl font-bold">
            Horaires
          </h2>
          <table className="mt-3 w-full border-collapse text-sm">
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
    </div>
  );
}
