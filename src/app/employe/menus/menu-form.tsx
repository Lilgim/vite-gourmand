"use client";

import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import type { Referential } from "@/lib/queries/employee";
import { type FormState, initialFormState } from "@/lib/validation";

type MenuFormProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  themes: Referential[];
  diets: Referential[];
  dishes: { id: number; name: string }[];
  defaults?: {
    menuId: number;
    title: string;
    description: string;
    theme_id: number;
    diet_id: number;
    min_people: number;
    price_per_person: string;
    conditions: string;
    stock: number;
    dish_ids: number[];
    images_text: string;
  };
  submitLabel: string;
};

export const MenuForm = ({
  action: serverAction,
  themes,
  diets,
  dishes,
  defaults,
  submitLabel,
}: MenuFormProps) => {
  const [state, action, pending] = useActionState(
    serverAction,
    initialFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;

  return (
    <form action={action} className="mt-4 flex flex-col gap-4" noValidate>
      {defaults && (
        <input type="hidden" name="menu_id" value={defaults.menuId} />
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
        label="Titre"
        name="title"
        required
        defaultValue={defaults?.title}
        errors={errors?.title}
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
          rows={3}
          required
          defaultValue={defaults?.description}
          aria-invalid={errors?.description ? true : undefined}
          className="rounded-lg border border-line px-3 py-2"
        />
        {errors?.description?.map((message) => (
          <p key={message} className="text-sm text-red-700">
            {message}
          </p>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="theme_id"
            className="text-[13px] font-medium text-ink"
          >
            Thème{" "}
            <span aria-hidden="true" className="text-primary">
              *
            </span>
          </label>
          <select
            id="theme_id"
            name="theme_id"
            required
            defaultValue={defaults?.theme_id ?? ""}
            className="rounded-lg border border-line bg-white px-3 py-2"
          >
            <option value="" disabled>
              — Choisir —
            </option>
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
          {errors?.theme_id?.map((message) => (
            <p key={message} className="text-sm text-red-700">
              {message}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="diet_id" className="text-[13px] font-medium text-ink">
            Régime{" "}
            <span aria-hidden="true" className="text-primary">
              *
            </span>
          </label>
          <select
            id="diet_id"
            name="diet_id"
            required
            defaultValue={defaults?.diet_id ?? ""}
            className="rounded-lg border border-line bg-white px-3 py-2"
          >
            <option value="" disabled>
              — Choisir —
            </option>
            {diets.map((diet) => (
              <option key={diet.id} value={diet.id}>
                {diet.name}
              </option>
            ))}
          </select>
          {errors?.diet_id?.map((message) => (
            <p key={message} className="text-sm text-red-700">
              {message}
            </p>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Minimum de personnes"
          name="min_people"
          type="number"
          required
          defaultValue={defaults ? String(defaults.min_people) : undefined}
          errors={errors?.min_people}
        />
        <FormField
          label="Prix par personne (€)"
          name="price_per_person"
          type="number"
          required
          defaultValue={defaults?.price_per_person}
          errors={errors?.price_per_person}
        />
        <FormField
          label="Stock (prestations)"
          name="stock"
          type="number"
          required
          defaultValue={defaults ? String(defaults.stock) : undefined}
          errors={errors?.stock}
        />
      </div>

      <fieldset>
        <legend className="text-[13px] font-medium text-ink">
          Plats du menu{" "}
          <span aria-hidden="true" className="text-primary">
            *
          </span>
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {dishes.map((dish) => (
            <label key={dish.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="dish_ids"
                value={dish.id}
                defaultChecked={defaults?.dish_ids.includes(dish.id)}
                className="h-4 w-4"
              />
              {dish.name}
            </label>
          ))}
        </div>
        {errors?.dish_ids?.map((message) => (
          <p key={message} className="mt-1 text-sm text-red-700">
            {message}
          </p>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="conditions"
          className="text-[13px] font-medium text-ink"
        >
          Conditions particulières
        </label>
        <textarea
          id="conditions"
          name="conditions"
          rows={2}
          defaultValue={defaults?.conditions}
          className="rounded-lg border border-line px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="images" className="text-[13px] font-medium text-ink">
          Galerie d'images
        </label>
        <p id="images-hint" className="text-xs text-muted">
          Une image par ligne au format « /chemin/image.jpg | texte alternatif
          ».
        </p>
        <textarea
          id="images"
          name="images"
          rows={3}
          defaultValue={defaults?.images_text}
          aria-describedby="images-hint"
          className="rounded-lg border border-line px-3 py-2 font-mono text-xs"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
};
