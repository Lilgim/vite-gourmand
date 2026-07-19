"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";
import { FormField } from "@/components/form-field";
import { initialFormState } from "@/lib/validation";

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const [state, action, pending] = useActionState(
    resetPassword,
    initialFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-line bg-surface p-4">
        <p role="status">{state.message}</p>
        <Link
          href="/connexion"
          className="mt-3 inline-block text-primary underline"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="token" value={token} />
      {"message" in state && state.message && (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      )}
      <FormField
        label="Nouveau mot de passe"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        hint="10 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial."
        errors={errors?.password ?? errors?.token}
      />
      <button
        type="submit"
        disabled={pending || !token}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {pending ? "Modification…" : "Modifier le mot de passe"}
      </button>
    </form>
  );
};
