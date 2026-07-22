import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";

// L'administration ne doit jamais être indexée par un moteur de recherche.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Garde serveur : l'administration exige strictement le rôle admin.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("admin");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm font-medium text-primary">Administration</p>
      <nav
        aria-label="Navigation de l'administration"
        className="mt-2 flex flex-wrap gap-2 border-b border-line pb-3 text-sm"
      >
        <Link
          href="/admin"
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-bg"
        >
          Statistiques
        </Link>
        <Link
          href="/admin/employes"
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-bg"
        >
          Comptes employés
        </Link>
        <Link
          href="/employe"
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-bg"
        >
          Espace employé
        </Link>
      </nav>
      {children}
    </div>
  );
}
