import Image from "next/image";
import Link from "next/link";
import { DAY_NAMES, formatTime } from "@/lib/labels";
import { getApprovedReviews, getOpeningHours } from "@/lib/queries/home";
import { formatPrice, getActiveMenus } from "@/lib/queries/menus";

const Arrow = () => <span aria-hidden="true">↗</span>;

export default async function HomePage() {
  const [reviews, hours, menus] = await Promise.all([
    getApprovedReviews(),
    getOpeningHours(),
    getActiveMenus(),
  ]);
  const featuredMenus = menus.slice(0, 3);
  const visibleReviews = reviews.slice(0, 3);

  return (
    <div className="overflow-hidden">
      <section className="landing-grain relative border-b border-line">
        <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
          <div className="landing-reveal relative z-10 max-w-2xl">
            <div className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
              <span className="h-px w-10 bg-accent" />
              Maison bordelaise · depuis 2015
            </div>
            <h1 className="text-[clamp(3.4rem,7vw,6.8rem)] leading-[0.88] tracking-[-0.055em] text-primary-dark">
              Le traiteur
              <span className="block italic text-primary">bordelais</span>
              de vos moments.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Des tables généreuses, une cuisine de saison et ce petit
              supplément d’âme qui transforme un repas en souvenir. Nous
              imaginons votre réception, de la première bouchée au dernier
              verre.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/menus"
                className="group inline-flex items-center gap-4 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(122,46,59,0.2)] transition hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                Découvrir nos menus
                <span
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-b border-ink/40 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
              >
                Parler de votre événement <Arrow />
              </Link>
            </div>
            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  Expérience
                </dt>
                <dd className="mt-1 font-display text-2xl text-primary-dark">
                  10 ans
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  Cuisine
                </dt>
                <dd className="mt-1 font-display text-2xl text-primary-dark">
                  De saison
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  Service
                </dt>
                <dd className="mt-1 font-display text-2xl text-primary-dark">
                  Sur mesure
                </dd>
              </div>
            </dl>
          </div>

          <div className="landing-reveal landing-delay relative mx-auto h-[520px] w-full max-w-[650px] sm:h-[610px]">
            <div className="absolute right-0 top-0 h-[84%] w-[80%] overflow-hidden rounded-t-[11rem] bg-[#e6d4cd] shadow-[0_30px_80px_rgba(64,32,40,0.16)]">
              <Image
                src="/images/menus/prestige-mariage-1.jpg"
                alt="Composition du menu Prestige Mariage"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 44vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-dark/85 to-transparent px-7 pb-7 pt-24 text-right text-white">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                  La signature maison
                </p>
                <p className="mt-1 font-display text-3xl">Prestige Mariage</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-[48%] overflow-hidden rounded-[1.5rem] border-[6px] border-bg bg-surface shadow-2xl">
              <Image
                src="/images/menus/cocktail-entreprise-1.jpg"
                alt="Composition du buffet Cocktail Entreprise"
                width={800}
                height={500}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute left-[8%] top-[9%] grid h-24 w-24 place-items-center rounded-full border border-accent/50 bg-bg/90 text-center shadow-lg backdrop-blur sm:h-28 sm:w-28">
              <span className="font-display text-sm italic leading-tight text-primary-dark">
                Fait avec
                <br />
                soin à
                <br />
                Bordeaux
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-primary-dark text-white"
        aria-label="Engagements de la maison"
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          {[
            [
              "01",
              "Produits choisis",
              "Des ingrédients de saison et des partenaires locaux.",
            ],
            [
              "02",
              "Menus composés",
              "Des formats adaptés à vos envies et à vos convives.",
            ],
            [
              "03",
              "Livraison maîtrisée",
              "Bordeaux et sa métropole, au moment convenu.",
            ],
          ].map(([number, title, text]) => (
            <div
              key={number}
              className="flex gap-5 py-7 sm:px-7 first:sm:pl-0 last:sm:pr-0"
            >
              <span className="font-display text-xl italic text-accent">
                {number}
              </span>
              <div>
                <p className="font-display text-xl">{title}</p>
                <p className="mt-1 text-sm leading-6 text-white/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32"
        aria-labelledby="menus-vedettes"
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              La carte
            </p>
            <h2
              id="menus-vedettes"
              className="mt-3 max-w-xl text-4xl leading-tight text-primary-dark sm:text-5xl"
            >
              Des menus pensés comme de belles histoires.
            </h2>
          </div>
          <Link
            href="/menus"
            className="group inline-flex items-center gap-3 text-sm font-semibold text-primary"
          >
            Voir toute la carte
            <span className="grid h-9 w-9 place-items-center rounded-full border border-primary transition group-hover:bg-primary group-hover:text-white">
              →
            </span>
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featuredMenus.map((menu, index) => (
            <article
              key={menu.id}
              className={`group ${index === 1 ? "md:translate-y-10" : ""}`}
            >
              <Link href={`/menus/${menu.id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-badge">
                  {menu.image_url && (
                    <Image
                      src={menu.image_url}
                      alt={menu.image_alt ?? ""}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-dark backdrop-blur">
                    {menu.theme}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 px-1 pt-5">
                  <div>
                    <h3 className="text-2xl leading-tight text-primary-dark transition group-hover:text-primary">
                      {menu.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      {menu.diet} · dès {menu.min_people} convives
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-primary">
                    {formatPrice(menu.price_per_person)}
                    <span className="block text-[10px] font-normal text-muted">
                      par pers.
                    </span>
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        className="relative mt-8 bg-[#e9dfce] py-24 lg:py-28"
        aria-labelledby="titre-avis"
      >
        <div
          className="absolute -top-6 left-1/2 font-display text-8xl leading-none text-primary/10"
          aria-hidden="true"
        >
          “
        </div>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Vos mots, notre fierté
            </p>
            <h2
              id="titre-avis"
              className="mt-3 text-4xl text-primary-dark sm:text-5xl"
            >
              Ils nous ont fait confiance
            </h2>
          </div>
          {reviews.length === 0 ? (
            <p className="mt-8 text-center text-muted">
              Aucun avis publié pour le moment.
            </p>
          ) : (
            <ul
              className={`mt-12 grid gap-5 ${visibleReviews.length === 1 ? "mx-auto max-w-2xl" : visibleReviews.length === 2 ? "mx-auto max-w-4xl md:grid-cols-2" : "lg:grid-cols-3"}`}
            >
              {visibleReviews.map((review, index) => {
                const highlighted = visibleReviews.length === 1 || index === 1;
                return (
                  <li
                    key={review.id}
                    className={`rounded-[1.25rem] border border-primary/10 p-7 ${highlighted ? "bg-primary text-white shadow-xl" : "bg-surface/70"}`}
                  >
                    <p
                      className={
                        highlighted ? "text-[#d1ba68]" : "text-primary"
                      }
                    >
                      <span aria-hidden="true">
                        {"★".repeat(review.rating)}
                      </span>
                      <span className="sr-only">
                        Note : {review.rating} sur 5
                      </span>
                    </p>
                    <blockquote
                      className={`mt-5 font-display text-xl italic leading-8 ${highlighted ? "text-white" : "text-ink"}`}
                    >
                      « {review.comment} »
                    </blockquote>
                    <p
                      className={`mt-6 text-xs font-semibold uppercase tracking-[0.16em] ${highlighted ? "text-white/60" : "text-muted"}`}
                    >
                      {review.first_name}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-32">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Une date en tête ?
          </p>
          <h2 className="mt-3 max-w-xl text-4xl leading-tight text-primary-dark sm:text-5xl">
            Commençons par parler de votre table.
          </h2>
          <p className="mt-6 max-w-lg leading-7 text-muted">
            Dites-nous ce que vous imaginez, le nombre de convives et le lieu.
            Notre équipe vous accompagne pour choisir le menu juste.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-4 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Nous contacter <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="rounded-[1.5rem] border border-line bg-surface p-7 shadow-[0_20px_60px_rgba(64,32,40,0.08)] sm:p-9">
          <div className="flex items-center justify-between border-b border-line pb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                Boutique & conseil
              </p>
              <h2
                id="titre-horaires"
                className="mt-1 text-3xl text-primary-dark"
              >
                Nos horaires
              </h2>
            </div>
            <span
              className="grid h-12 w-12 place-items-center rounded-full bg-bg text-xl text-primary"
              aria-hidden="true"
            >
              ⌖
            </span>
          </div>
          <table className="mt-4 w-full border-collapse text-sm">
            <caption className="sr-only">
              Horaires d'ouverture de la boutique
            </caption>
            <tbody>
              {hours.map((hour) => (
                <tr
                  key={hour.day_of_week}
                  className="border-b border-line last:border-0"
                >
                  <th scope="row" className="py-2.5 text-left font-medium">
                    {DAY_NAMES[hour.day_of_week]}
                  </th>
                  <td className="py-2.5 text-right text-muted">
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
        </div>
      </section>
    </div>
  );
}
