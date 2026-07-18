import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function InscriptionPage() {
  const user = await getCurrentUser();
  if (user) redirect("/compte");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl">Créer un compte</h1>
      <RegisterForm />
      <p className="mt-4 text-sm">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-primary underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
