"use client";

import { useActionState } from "react";
import { createEmployee } from "@/app/actions/admin";
import { FormField } from "@/components/form-field";
import { initialFormState } from "@/lib/validation";

export const EmployeeForm = () => {
  const [state, action, pending] = useActionState(
    createEmployee,
    initialFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;

  return (
    <form action={action} className="mt-3 flex flex-col gap-4" noValidate>
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      )}
      {state.status === "success" && state.message && (
        <p
          role="status"
          className="rounded-lg bg-badge px-3 py-2 text-sm text-primary"
        >
          {state.message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Prénom"
          name="first_name"
          required
          errors={errors?.first_name}
        />
        <FormField
          label="Nom"
          name="last_name"
          required
          errors={errors?.last_name}
        />
      </div>
      <FormField
        label="Adresse email"
        name="email"
        type="email"
        required
        errors={errors?.email}
      />
      <FormField
        label="Téléphone (facultatif)"
        name="phone"
        type="tel"
        errors={errors?.phone}
      />
      <FormField
        label="Mot de passe initial"
        name="password"
        type="password"
        required
        hint="Au moins 10 caractères, une majuscule et un chiffre. À changer par l'employé."
        errors={errors?.password}
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Création…" : "Créer le compte"}
      </button>
    </form>
  );
};
