import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl">Mot de passe oublié</h1>
      <p className="mt-2 text-sm text-muted">
        Indiquez votre email. Le lien reçu sera valable 30 minutes.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
