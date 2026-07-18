"use client";

import { useActionState, useState } from "react";
import { cancelOrder } from "@/app/actions/account";
import { initialFormState } from "@/lib/validation";

type CancelButtonProps = { orderId: number };

// Annulation en deux temps (pas de window.confirm) : un premier clic arme
// la confirmation, le second soumet réellement.
export const CancelButton = ({ orderId }: CancelButtonProps) => {
  const [state, action, pending] = useActionState(
    cancelOrder,
    initialFormState,
  );
  const [armed, setArmed] = useState(false);

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="order_id" value={orderId} />
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      )}
      {armed ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-red-800">
            Confirmer l'annulation définitive ?
          </p>
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
          >
            {pending ? "Annulation…" : "Oui, annuler la commande"}
          </button>
          <button
            type="button"
            onClick={() => setArmed(false)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Non, la conserver
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="self-start rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-50"
        >
          Annuler la commande
        </button>
      )}
    </form>
  );
};
