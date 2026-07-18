import "server-only";
import { query } from "@/lib/db";

export type ApprovedReview = {
  id: number;
  rating: number;
  comment: string;
  first_name: string;
  created_at: string;
};

// Seuls les avis validés par un employé sont visibles publiquement.
export const getApprovedReviews = (limit = 6): Promise<ApprovedReview[]> =>
  query<ApprovedReview>(
    `SELECT r.id, r.rating, r.comment, u.first_name, r.created_at::text
       FROM reviews r
       JOIN users u ON u.id = r.user_id
      WHERE r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT $1`,
    [limit],
  );

export type OpeningHour = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

export const DAY_NAMES = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export const getOpeningHours = (): Promise<OpeningHour[]> =>
  query<OpeningHour>(
    `SELECT day_of_week, open_time::text, close_time::text, is_closed
       FROM opening_hours
      ORDER BY day_of_week`,
  );

// "09:00:00" -> "09:00"
export const formatTime = (time: string | null): string =>
  time ? time.slice(0, 5).replace(":", "h") : "";
