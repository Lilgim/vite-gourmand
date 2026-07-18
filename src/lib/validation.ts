import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Adresse email invalide").max(255),
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  first_name: z.string().trim().min(1, "Le prénom est obligatoire").max(100),
  last_name: z.string().trim().min(1, "Le nom est obligatoire").max(100),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+33|0)[1-9]\d{8}$/,
      "Numéro de téléphone invalide (format français)",
    )
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est obligatoire"),
});

export const reviewSchema = z.object({
  rating: z.coerce
    .number("Note invalide")
    .int("Note invalide")
    .min(1, "La note va de 1 à 5")
    .max(5, "La note va de 1 à 5"),
  comment: z
    .string()
    .trim()
    .min(10, "Votre avis doit contenir au moins 10 caractères")
    .max(1000, "Votre avis ne peut pas dépasser 1000 caractères"),
});

export const profileSchema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est obligatoire").max(100),
  last_name: z.string().trim().min(1, "Le nom est obligatoire").max(100),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+33|0)[1-9]\d{8}$/,
      "Numéro de téléphone invalide (format français)",
    )
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  postal_code: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
});

// Le minimum de personnes dépend du menu : schéma construit à la volée.
export const createOrderSchema = (minPeople: number) =>
  z.object({
    people_count: z.coerce
      .number("Nombre de convives invalide")
      .int("Nombre de convives invalide")
      .min(
        minPeople,
        `Ce menu est disponible à partir de ${minPeople} personnes`,
      )
      .max(1000, "Nombre de convives trop élevé"),
    event_date: z.iso
      .date("Date invalide")
      .refine(
        (date) => new Date(`${date}T23:59:59`) >= new Date(),
        "La date de l'événement doit être future",
      ),
    event_time: z.iso.time({
      message: "Heure invalide",
      precision: -1,
    }),
    event_address: z
      .string()
      .trim()
      .min(1, "L'adresse est obligatoire")
      .max(255),
    event_postal_code: z
      .string()
      .trim()
      .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
    event_city: z.string().trim().min(1, "La ville est obligatoire").max(100),
    phone: z
      .string()
      .trim()
      .regex(
        /^(\+33|0)[1-9]\d{8}$/,
        "Numéro de GSM invalide (format français)",
      ),
    distance_km: z.coerce
      .number("Distance invalide")
      .min(0, "La distance ne peut pas être négative")
      .max(200, "Nous livrons dans un rayon de 200 km"),
  });

export type FieldErrors = Record<string, string[]>;

export type FormState =
  | { status: "idle" }
  | { status: "error"; message?: string; errors?: FieldErrors }
  | { status: "success"; message?: string };

export const initialFormState: FormState = { status: "idle" };
