import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Mon compte" };

export default async function ComptePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Mon compte</h1>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-zinc-600">Nom complet</dt>
          <dd className="font-medium">
            {user.first_name} {user.last_name}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-zinc-600">Email</dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-zinc-600">Téléphone</dt>
          <dd className="font-medium">{user.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-zinc-600">Rôle</dt>
          <dd className="font-medium">{user.role}</dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-zinc-600">
        La modification des données personnelles et l'historique des commandes
        arrivent avec les prochaines fonctionnalités.
      </p>
    </div>
  );
}
