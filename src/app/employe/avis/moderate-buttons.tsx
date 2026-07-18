"use client";

import { useActionState } from "react";
import { moderateReview } from "@/app/actions/employee";
import { initialFormState } from "@/lib/validation";

type ModerateButtonsProps = { reviewId: number };

export const ModerateButtons = ({ reviewId }: ModerateButtonsProps) => {
  const [state, action, pending] = useActionState(
    moderateReview,
    initialFormState,
  );

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="rounded-lg bg-badge px-3 py-2 text-sm text-primary"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="review_id" value={reviewId} />
      {state.status === "error" && state.message && (
        <p role="alert" className="w-full text-sm text-red-700">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        name="decision"
        value="approved"
        disabled={pending}
        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        Valider et publier
      </button>
      <button
        type="submit"
        name="decision"
        value="rejected"
        disabled={pending}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-60"
      >
        Refuser
      </button>
    </form>
  );
};
