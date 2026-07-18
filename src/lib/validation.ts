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

export type FieldErrors = Record<string, string[]>;

export type FormState =
  | { status: "idle" }
  | { status: "error"; message?: string; errors?: FieldErrors }
  | { status: "success"; message?: string };

export const initialFormState: FormState = { status: "idle" };
