import type { Metadata } from "next";
import { getOpeningHours } from "@/lib/queries/home";
import { HoursForm } from "./hours-form";

export const metadata: Metadata = { title: "Horaires — Espace employé" };

export default async function EmployeHorairesPage() {
  const hours = await getOpeningHours();

  return (
    <div className="mt-6 max-w-xl">
      <h1 className="text-2xl font-bold">Horaires d'ouverture</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Ces horaires sont affichés sur l'accueil et la page contact.
      </p>
      <HoursForm
        defaults={hours.map((hour) => ({
          day: hour.day_of_week,
          isClosed: hour.is_closed,
          openTime: hour.open_time?.slice(0, 5) ?? "",
          closeTime: hour.close_time?.slice(0, 5) ?? "",
        }))}
      />
    </div>
  );
}
