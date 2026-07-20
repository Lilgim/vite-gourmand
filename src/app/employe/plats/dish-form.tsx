"use client";

import { useActionState } from "react";
import { deleteDish, saveDish } from "@/app/actions/employee";
import { FormField } from "@/components/form-field";
import type { Referential } from "@/lib/queries/employee";
import { initialFormState } from "@/lib/validation";

type DishFormProps = {
  allergens: Referential[];
  defaults?: {
    dishId: number;
    name: string;
    description: string;
    allergen_ids: number[];
    menuCount: number;
  };
};

export const DishForm = ({ allergens, defaults }: DishFormProps) => {
  const [state, action, pending] = useActionState(saveDish, initialFormState);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteDish,
    initialFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;

  if (deleteState.status === "success") {
    return (
      <p
        role="status"
        className="rounded-lg bg-badge px-3 py-2 text-sm text-primary"
      >
        {deleteState.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={action} className="flex flex-col gap-3" noValidate>
        {defaults && (
          <input type="hidden" name="dish_id" value={defaults.dishId} />
        )}
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

        <FormField
          label="Nom du plat"
          name="name"
          required
          defaultValue={defaults?.name}
          errors={errors?.name}
        />
        <FormField
          label="Description"
          name="description"
          defaultValue={defaults?.description}
          errors={errors?.description}
        />
        <fieldset>
          <legend className="text-[13px] font-medium text-ink">
            Allergènes
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3">
            {allergens.map((allergen) => (
              <label
                key={allergen.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="allergen_ids"
                  value={allergen.id}
                  defaultChecked={defaults?.allergen_ids.includes(allergen.id)}
                  className="h-4 w-4"
                />
                {allergen.name}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {pending
            ? "Enregistrement…"
            : defaults
              ? "Enregistrer le plat"
              : "Créer le plat"}
        </button>
      </form>

      {defaults && (
        <form action={deleteAction}>
          <input type="hidden" name="dish_id" value={defaults.dishId} />
          {deleteState.status === "error" && deleteState.message && (
            <p
              role="alert"
              className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {deleteState.message}
            </p>
          )}
          <button
            type="submit"
            disabled={deletePending || defaults.menuCount > 0}
            title={
              defaults.menuCount > 0
                ? `Utilisé par ${defaults.menuCount} menu(s)`
                : undefined
            }
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
          >
            {deletePending ? "Suppression…" : "Supprimer ce plat"}
          </button>
          {defaults.menuCount > 0 && (
            <span className="ml-2 text-xs text-muted">
              Utilisé par {defaults.menuCount} menu(s) — retirez-le des menus
              pour pouvoir le supprimer.
            </span>
          )}
        </form>
      )}
    </div>
  );
};
