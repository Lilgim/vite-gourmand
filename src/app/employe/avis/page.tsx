import type { Metadata } from "next";
import { getPendingReviews } from "@/lib/queries/employee";
import { ModerateButtons } from "./moderate-buttons";

export const metadata: Metadata = { title: "Avis à modérer" };

export default async function EmployeAvisPage() {
  const reviews = await getPendingReviews();

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold">Avis à modérer</h1>
      {reviews.length === 0 ? (
        <p className="mt-4 rounded border border-dashed border-zinc-300 p-4 text-center text-zinc-600">
          Aucun avis en attente de modération.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded border border-zinc-200 p-4 text-sm"
            >
              <p aria-hidden="true" className="text-amber-500">
                {"★".repeat(review.rating)}
                <span className="text-zinc-300">
                  {"★".repeat(5 - review.rating)}
                </span>
              </p>
              <p className="sr-only">Note : {review.rating} sur 5</p>
              <p className="mt-2 text-zinc-700">{review.comment}</p>
              <p className="mt-2 text-zinc-500">
                {review.client_name} — {review.menu_title} —{" "}
                {new Date(review.created_at).toLocaleDateString("fr-FR")}
              </p>
              <div className="mt-3">
                <ModerateButtons reviewId={review.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
