// Libellés et helpers d'affichage partagés serveur/client.
// Aucune dépendance serveur ici : ce module est importable partout.

export const ORDER_STATUS_LABELS: Record<string, string> = {
  submitted: "Soumise — en attente d'acceptation",
  accepted: "Acceptée",
  in_preparation: "En préparation",
  in_delivery: "En cours de livraison",
  delivered: "Livrée",
  awaiting_equipment_return: "En attente du retour de matériel",
  completed: "Terminée",
  cancelled: "Annulée",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "En attente de validation par notre équipe",
  approved: "Publié sur le site",
  rejected: "Refusé par notre équipe",
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

// "09:00:00" -> "09h00"
export const formatTime = (time: string | null): string =>
  time ? time.slice(0, 5).replace(":", "h") : "";
