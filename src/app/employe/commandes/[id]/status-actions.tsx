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
      <p className="text-sm text-muted">
        Cette commande est dans un état final : aucune action disponible.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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

      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setSelected(status)}
            aria-pressed={selected === status}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              selected === status
                ? "border-primary bg-primary text-white"
                : status === "cancelled"
                  ? "border-red-300 text-red-800 hover:bg-red-50"
                  : "border-line hover:bg-bg"
            }`}
          >
            → {ORDER_STATUS_LABELS[status] ?? status}
          </button>
        ))}
      </div>

      {selected && (
        <form
          action={action}
          className="flex flex-col gap-3 rounded-lg border border-line p-4"
        >
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="new_status" value={selected} />
          <p className="text-[13px] font-medium text-ink">
            Passer la commande à « {ORDER_STATUS_LABELS[selected] ?? selected} »
          </p>

          {requiresContactAndReason(selected) && (
            <>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="contact_mode"
                  className="text-[13px] font-medium text-ink"
                >
                  Mode de contact avec le client{" "}
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>
                </label>
                <select
                  id="contact_mode"
                  name="contact_mode"
                  required
                  className="rounded-lg border border-line bg-white px-3 py-2"
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
                <label
                  htmlFor="reason"
                  className="text-[13px] font-medium text-ink"
                >
                  Motif{" "}
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={2}
                  required
                  className="rounded-lg border border-line px-3 py-2"
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {pending ? "Mise à jour…" : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-bg"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
