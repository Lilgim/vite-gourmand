import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const Header = async () => {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/90 backdrop-blur-xl">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-4 px-5 lg:px-8"
      >
        <Link
          href="/"
          className="flex items-center gap-3 font-display text-xl text-primary"
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-full border border-primary/30 text-sm italic"
            aria-hidden="true"
          >
            V
          </span>
          <span>Vite &amp; Gourmand</span>
        </Link>
        <div className="order-3 flex w-full items-center gap-5 border-t border-line/70 py-2 text-sm sm:order-none sm:ml-8 sm:w-auto sm:border-0 sm:py-0">
          <Link href="/menus" className="transition hover:text-primary">
            Nos menus
          </Link>
          <Link href="/entreprise" className="transition hover:text-primary">
            La maison
          </Link>
          <Link href="/contact" className="transition hover:text-primary">
            Contact
          </Link>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-sm">
          {user ? (
            <>
              {(user.role === "employee" || user.role === "admin") && (
                <Link href="/employe" className="hover:underline">
                  Espace employé
                </Link>
              )}
              {user.role === "admin" && (
                <Link href="/admin" className="hover:underline">
                  Administration
                </Link>
              )}
              <Link href="/compte" className="hover:underline">
                Mon compte ({user.first_name})
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-line bg-surface px-3 py-1 hover:bg-bg"
                >
                  Se déconnecter
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/connexion" className="transition hover:text-primary">
                Se connecter
              </Link>
              <Link
                href="/inscription"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark"
              >
                Nous rejoindre
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
