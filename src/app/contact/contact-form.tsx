"use client";

import { useActionState } from "react";
import { sendContactRequest } from "@/app/actions/contact";
import { FormField } from "@/components/form-field";
import { initialFormState } from "@/lib/validation";

export const ContactForm = () => {
  const [state, action, pending] = useActionState(
    sendContactRequest,
    initialFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;

  return (
    <form action={action} className="mt-4 flex flex-col gap-4" noValidate>
      {"message" in state && state.message && (
        <p role="status" className="rounded-lg bg-badge px-3 py-2 text-sm">
          {state.message}
        </p>
      )}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <FormField label="Titre" name="title" required errors={errors?.title} />
      <FormField
        label="Votre email"
        name="email"
        type="email"
        required
        autoComplete="email"
        errors={errors?.email}
      />
      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-[13px] font-medium text-ink"
        >
          Description{" "}
          <span aria-hidden="true" className="text-primary">
            *
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          aria-invalid={errors?.description?.length ? true : undefined}
          aria-describedby={
            errors?.description?.length ? "description-error" : undefined
          }
          className="rounded-lg border border-line px-3 py-2 focus:outline-2 focus:outline-primary"
        />
        {errors?.description && (
          <div id="description-error">
            {errors.description.map((error) => (
              <p key={error} className="text-sm text-red-700">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer la demande"}
      </button>
    </form>
  );
};
