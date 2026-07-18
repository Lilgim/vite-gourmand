import Link from "next/link";

export const Footer = () => (
  <footer className="mt-12 border-t border-zinc-200 bg-zinc-50">
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
      <div>
        <p className="font-bold text-emerald-800">Vite &amp; Gourmand</p>
        <p className="mt-2 text-sm text-zinc-600">
          Traiteur à Bordeaux depuis 2015. Mariages, anniversaires et événements
          d'entreprise.
        </p>
      </div>
      <nav aria-label="Liens du site" className="text-sm">
        <p className="font-medium">Le site</p>
        <ul className="mt-2 space-y-1">
          <li>
            <Link href="/menus" className="hover:underline">
              Nos menus
            </Link>
          </li>
          <li>
            <Link href="/entreprise" className="hover:underline">
              L'entreprise
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
      <nav aria-label="Informations légales" className="text-sm">
        <p className="font-medium">Informations légales</p>
        <ul className="mt-2 space-y-1">
          <li>
            <Link href="/mentions-legales" className="hover:underline">
              Mentions légales
            </Link>
          </li>
          <li>
            <Link href="/cgv" className="hover:underline">
              Conditions générales de vente
            </Link>
          </li>
        </ul>
      </nav>
    </div>
    <p className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500">
      © 2026 Vite &amp; Gourmand — projet pédagogique réalisé dans le cadre du
      TP Développeur Web et Web Mobile
    </p>
  </footer>
);
