import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const Header = async () => {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3"
      >
        <Link href="/" className="text-lg font-bold text-emerald-800">
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
                  className="rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-50"
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
                className="rounded bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-800"
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
