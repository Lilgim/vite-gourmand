"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/account";
import { FormField } from "@/components/form-field";
import { initialFormState } from "@/lib/validation";

type ProfileFormProps = {
  defaults: {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    postal_code: string;
    city: string;
  };
};

export const ProfileForm = ({ defaults }: ProfileFormProps) => {
  const [state, action, pending] = useActionState(
    updateProfile,
    initialFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;

  return (
    <form action={action} className="mt-4 flex flex-col gap-4" noValidate>
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
          autoComplete="given-name"
          defaultValue={defaults.first_name}
          errors={errors?.first_name}
        />
        <FormField
          label="Nom"
          name="last_name"
          required
          autoComplete="family-name"
          defaultValue={defaults.last_name}
          errors={errors?.last_name}
        />
      </div>
      <FormField
        label="Téléphone"
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={defaults.phone}
        errors={errors?.phone}
      />
      <FormField
        label="Adresse"
        name="address"
        autoComplete="street-address"
        defaultValue={defaults.address}
        errors={errors?.address}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Code postal"
          name="postal_code"
          autoComplete="postal-code"
          defaultValue={defaults.postal_code}
          errors={errors?.postal_code}
        />
        <FormField
          label="Ville"
          name="city"
          autoComplete="address-level2"
          defaultValue={defaults.city}
          errors={errors?.city}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer mes informations"}
      </button>
    </form>
  );
};
