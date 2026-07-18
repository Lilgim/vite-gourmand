import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const Header = async () => {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-surface">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3"
      >
        <Link href="/" className="font-display text-xl text-primary">
          Vite &amp; Gourmand
        </Link>
        <div className="ml-auto flex flex-wrap items-center gap-4 text-sm">
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
              <Link href="/connexion" className="hover:underline">
                Se connecter
              </Link>
              <Link
                href="/inscription"
                className="rounded-lg bg-primary px-3 py-1 text-white hover:bg-primary-dark"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
