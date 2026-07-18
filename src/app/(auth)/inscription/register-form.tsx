"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { FormField } from "@/components/form-field";
import { initialFormState } from "@/lib/validation";

export const RegisterForm = () => {
  const [state, action, pending] = useActionState(register, initialFormState);
  const errors = state.status === "error" ? state.errors : undefined;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      )}
      <FormField
        label="Prénom"
        name="first_name"
        required
        autoComplete="given-name"
        errors={errors?.first_name}
      />
      <FormField
        label="Nom"
        name="last_name"
        required
        autoComplete="family-name"
        errors={errors?.last_name}
      />
      <FormField
        label="Adresse email"
        name="email"
        type="email"
        required
        autoComplete="email"
        errors={errors?.email}
      />
      <FormField
        label="Téléphone (facultatif)"
        name="phone"
        type="tel"
        autoComplete="tel"
        errors={errors?.phone}
      />
      <FormField
        label="Mot de passe"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        hint="Au moins 10 caractères, une majuscule et un chiffre."
        errors={errors?.password}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Création en cours…" : "Créer mon compte"}
      </button>
    </form>
  );
};
