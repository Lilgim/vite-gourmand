"use client";

import { useActionState, useState } from "react";
import { advanceOrderStatus } from "@/app/actions/employee";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import {
  ORDER_TRANSITIONS,
  type OrderStatus,
  requiresContactAndReason,
} from "@/lib/status";
import { initialFormState } from "@/lib/validation";

type StatusActionsProps = {
  orderId: number;
  currentStatus: OrderStatus;
};

const CONTACT_MODES = ["Téléphone", "Email", "En boutique"];

export const StatusActions = ({
  orderId,
  currentStatus,
}: StatusActionsProps) => {
  const [state, action, pending] = useActionState(
    advanceOrderStatus,
    initialFormState,
  );
  const [selected, setSelected] = useState<OrderStatus | null>(null);

  const nextStatuses = ORDER_TRANSITIONS[currentStatus] ?? [];

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        Cette commande est dans un état final : aucune action disponible.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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

      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setSelected(status)}
            aria-pressed={selected === status}
            className={`rounded border px-3 py-1.5 text-sm font-medium ${
              selected === status
                ? "border-emerald-700 bg-emerald-700 text-white"
                : status === "cancelled"
                  ? "border-red-300 text-red-800 hover:bg-red-50"
                  : "border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            → {ORDER_STATUS_LABELS[status] ?? status}
          </button>
        ))}
      </div>

      {selected && (
        <form
          action={action}
          className="flex flex-col gap-3 rounded border border-zinc-200 p-4"
        >
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="new_status" value={selected} />
          <p className="text-sm font-medium">
            Passer la commande à « {ORDER_STATUS_LABELS[selected] ?? selected} »
          </p>

          {requiresContactAndReason(selected) && (
            <>
              <div className="flex flex-col gap-1">
                <label htmlFor="contact_mode" className="text-sm font-medium">
                  Mode de contact avec le client{" "}
                  <span aria-hidden="true" className="text-red-700">
                    *
                  </span>
                </label>
                <select
                  id="contact_mode"
                  name="contact_mode"
                  required
                  className="rounded border border-zinc-300 bg-white px-3 py-2"
                >
                  <option value="">— Choisir —</option>
                  {CONTACT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="reason" className="text-sm font-medium">
                  Motif{" "}
                  <span aria-hidden="true" className="text-red-700">
                    *
                  </span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={2}
                  required
                  className="rounded border border-zinc-300 px-3 py-2"
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {pending ? "Mise à jour…" : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
