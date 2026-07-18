"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { FormField } from "@/components/form-field";
import { initialFormState } from "@/lib/validation";

export const LoginForm = () => {
  const [state, action, pending] = useActionState(login, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      )}
      <FormField
        label="Adresse email"
        name="email"
        type="email"
        required
        autoComplete="email"
        errors={state.status === "error" ? state.errors?.email : undefined}
      />
      <FormField
        label="Mot de passe"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        errors={state.status === "error" ? state.errors?.password : undefined}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Connexion en cours…" : "Se connecter"}
      </button>
    </form>
  );
};
