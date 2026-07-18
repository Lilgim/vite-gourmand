import Link from "next/link";

export const Footer = () => (
  <footer className="mt-12 bg-primary-dark text-white">
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
      <div>
        <p className="font-display text-xl text-white">Vite &amp; Gourmand</p>
        <p className="mt-2 text-sm text-white/70">
          Traiteur à Bordeaux depuis 2015. Mariages, anniversaires et événements
          d'entreprise.
        </p>
      </div>
      <nav aria-label="Liens du site" className="text-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-white/55">
          Le site
        </p>
        <ul className="mt-3 space-y-1.5">
          <li>
            <Link href="/menus" className="text-white hover:underline">
              Nos menus
            </Link>
          </li>
          <li>
            <Link href="/entreprise" className="text-white hover:underline">
              L'entreprise
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-white hover:underline">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
      <nav aria-label="Informations légales" className="text-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-white/55">
          Informations légales
        </p>
        <ul className="mt-3 space-y-1.5">
          <li>
            <Link
              href="/mentions-legales"
              className="text-white hover:underline"
            >
              Mentions légales
            </Link>
          </li>
          <li>
            <Link href="/cgv" className="text-white hover:underline">
              Conditions générales de vente
            </Link>
          </li>
        </ul>
      </nav>
    </div>
    <p className="border-t border-white/15 py-4 text-center text-xs text-white/70">
      © 2026 Vite &amp; Gourmand — projet pédagogique réalisé dans le cadre du
      TP Développeur Web et Web Mobile
    </p>
  </footer>
);
