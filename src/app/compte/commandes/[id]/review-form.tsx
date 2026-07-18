"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/app/actions/reviews";
import { initialFormState } from "@/lib/validation";

type ReviewFormProps = { orderId: number };

const RATING_LABELS = [
  "",
  "1 — Très déçu",
  "2 — Déçu",
  "3 — Correct",
  "4 — Satisfait",
  "5 — Excellent",
];

export const ReviewForm = ({ orderId }: ReviewFormProps) => {
  const [state, action, pending] = useActionState(
    submitReview,
    initialFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;
  const [rating, setRating] = useState(5);

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
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="order_id" value={orderId} />

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      )}

      <fieldset>
        <legend className="text-sm font-medium">
          Votre note{" "}
          <span aria-hidden="true" className="text-red-700">
            *
          </span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className={`cursor-pointer rounded border px-3 py-1.5 text-sm ${
                rating === value
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="sr-only"
              />
              {RATING_LABELS[value]}
            </label>
          ))}
        </div>
        {errors?.rating?.map((message) => (
          <p key={message} className="mt-1 text-sm text-red-700">
            {message}
          </p>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="comment" className="text-sm font-medium">
          Votre avis{" "}
          <span aria-hidden="true" className="text-red-700">
            *
          </span>
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          required
          minLength={10}
          maxLength={1000}
          aria-invalid={errors?.comment ? true : undefined}
          className="rounded border border-zinc-300 px-3 py-2 focus:outline-2 focus:outline-emerald-700"
        />
        {errors?.comment?.map((message) => (
          <p key={message} className="text-sm text-red-700">
            {message}
          </p>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Déposer mon avis"}
      </button>
    </form>
  );
};
