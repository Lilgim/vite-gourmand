import Link from "next/link";
import { requireRole } from "@/lib/auth";

// Garde serveur : tout l'espace employé exige le rôle employé (ou admin,
// qui hérite des capacités employé).
export default async function EmployeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("employee");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm font-medium text-emerald-800">Espace employé</p>
      <nav
        aria-label="Navigation de l'espace employé"
        className="mt-2 flex flex-wrap gap-2 border-b border-zinc-200 pb-3 text-sm"
      >
        <Link
          href="/employe"
          className="rounded border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
        >
          Commandes
        </Link>
        <Link
          href="/employe/menus"
          className="rounded border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
        >
          Menus
        </Link>
        <Link
          href="/employe/plats"
          className="rounded border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
        >
          Plats
        </Link>
        <Link
          href="/employe/horaires"
          className="rounded border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
        >
          Horaires
        </Link>
        <Link
          href="/employe/avis"
          className="rounded border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
        >
          Avis à modérer
        </Link>
      </nav>
      {children}
    </div>
  );
}
