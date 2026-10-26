import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";

// L'espace employé ne doit jamais être indexé par un moteur de recherche.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Garde serveur : tout l'espace employé exige le rôle employé (ou admin,
// qui hérite des capacités employé).
export default async function EmployeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("employee");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm font-medium text-primary">Espace employé</p>
      <nav
        aria-label="Navigation de l'espace employé"
        className="mt-2 flex flex-wrap gap-2 border-b border-line pb-3 text-sm"
      >
        <Link
          href="/employe"
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-bg"
        >
          Commandes
        </Link>
        <Link
          href="/employe/menus"
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-bg"
        >
          Menus
        </Link>
        <Link
          href="/employe/plats"
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-bg"
        >
          Plats
        </Link>
        <Link
          href="/employe/horaires"
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-bg"
        >
          Horaires
        </Link>
        <Link
          href="/employe/avis"
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-bg"
        >
          Avis à modérer
        </Link>
      </nav>
      {children}
    </div>
  );
}
