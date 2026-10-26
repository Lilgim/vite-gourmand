import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";

// Espace client : jamais indexé, et garde serveur en défense en profondeur
// (en complément du contrôle optimiste du middleware).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function CompteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUser();
  return <>{children}</>;
}
