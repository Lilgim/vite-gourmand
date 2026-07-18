import type { Metadata } from "next";
import { getPendingReviews } from "@/lib/queries/employee";
import { ModerateButtons } from "./moderate-buttons";

export const metadata: Metadata = { title: "Avis à modérer" };

export default async function EmployeAvisPage() {
  const reviews = await getPendingReviews();

  return (
    <div className="mt-6">
      <h1 className="text-2xl">Avis à modérer</h1>
      {reviews.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-line p-4 text-center text-muted">
          Aucun avis en attente de modération.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-lg border border-line p-4 text-sm"
            >
              <p aria-hidden="true" className="text-primary">
                {"★".repeat(review.rating)}
                <span className="text-line">
                  {"★".repeat(5 - review.rating)}
                </span>
              </p>
              <p className="sr-only">Note : {review.rating} sur 5</p>
              <p className="mt-2 text-ink">{review.comment}</p>
              <p className="mt-2 text-muted">
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
