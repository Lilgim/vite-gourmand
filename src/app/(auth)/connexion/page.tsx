import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

export default async function ConnexionPage() {
  const user = await getCurrentUser();
  if (user) redirect("/compte");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl">Se connecter</h1>
      <LoginForm />
      <p className="mt-4 text-sm">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-primary underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
