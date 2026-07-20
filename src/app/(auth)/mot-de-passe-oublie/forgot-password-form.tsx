"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { FormField } from "@/components/form-field";
import { initialFormState } from "@/lib/validation";

export const ForgotPasswordForm = () => {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initialFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {"message" in state && state.message && (
        <p role="status" className="rounded-lg bg-badge px-3 py-2 text-sm">
          {state.message}
        </p>
      )}
      <FormField
        label="Adresse email"
        name="email"
        type="email"
        required
        autoComplete="email"
        errors={errors?.email}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Recevoir le lien"}
      </button>
    </form>
  );
};
