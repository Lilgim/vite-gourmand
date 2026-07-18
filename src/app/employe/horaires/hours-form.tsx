"use client";

import { useActionState } from "react";
import { updateOpeningHours } from "@/app/actions/employee";
import { DAY_NAMES } from "@/lib/labels";
import { initialFormState } from "@/lib/validation";

type HoursFormProps = {
  defaults: {
    day: number;
    isClosed: boolean;
    openTime: string;
    closeTime: string;
  }[];
};

export const HoursForm = ({ defaults }: HoursFormProps) => {
  const [state, action, pending] = useActionState(
    updateOpeningHours,
    initialFormState,
  );

  return (
    <form action={action} className="mt-4 flex flex-col gap-3" noValidate>
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      )}
      {state.status === "success" && state.message && (
        <p
          role="status"
          className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          {state.message}
        </p>
      )}

      {defaults.map((entry) => (
        <fieldset
          key={entry.day}
          className="grid grid-cols-1 items-center gap-2 rounded border border-zinc-200 p-3 sm:grid-cols-4"
        >
          <legend className="sr-only">{DAY_NAMES[entry.day]}</legend>
          <p className="font-medium">{DAY_NAMES[entry.day]}</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={`closed_${entry.day}`}
              defaultChecked={entry.isClosed}
              className="h-4 w-4"
            />
            Fermé
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span>Ouverture</span>
            <input
              type="time"
              name={`open_${entry.day}`}
              defaultValue={entry.openTime}
              className="rounded border border-zinc-300 px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span>Fermeture</span>
            <input
              type="time"
              name={`close_${entry.day}`}
              defaultValue={entry.closeTime}
              className="rounded border border-zinc-300 px-2 py-1"
            />
          </label>
        </fieldset>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer les horaires"}
      </button>
    </form>
  );
};
