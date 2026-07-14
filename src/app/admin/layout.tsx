import Link from "next/link";
import { requireRole } from "@/lib/auth";

// Garde serveur : l'administration exige strictement le rôle admin.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("admin");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm font-medium text-emerald-800">Administration</p>
      <nav
        aria-label="Navigation de l'administration"
        className="mt-2 flex flex-wrap gap-2 border-b border-zinc-200 pb-3 text-sm"
      >
        <Link
          href="/admin"
          className="rounded border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
        >
          Statistiques
        </Link>
        <Link
          href="/admin/employes"
          className="rounded border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
        >
          Comptes employés
        </Link>
        <Link
          href="/employe"
          className="rounded border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
        >
          Espace employé
        </Link>
      </nav>
      {children}
    </div>
  );
}
