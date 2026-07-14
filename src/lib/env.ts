import { z } from "zod";

// Valide les variables d'environnement au démarrage : échec explicite
// plutôt qu'une erreur obscure à la première requête.
const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL manquante"),
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI manquante"),
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET trop courte (16 caractères minimum)"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  AUTH_SECRET: process.env.AUTH_SECRET,
});
