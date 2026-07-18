// Machine à états des commandes — le sujet impose la progression :
// acceptée → en préparation → en cours de livraison → livrée →
// en attente du retour de matériel → terminée.
// 'submitted' précède l'acceptation ; l'annulation par un employé exige
// un mode de contact et un motif (contrôlé dans la Server Action).

export type OrderStatus =
  | "submitted"
  | "accepted"
  | "in_preparation"
  | "in_delivery"
  | "delivered"
  | "awaiting_equipment_return"
  | "completed"
  | "cancelled";

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  submitted: ["accepted", "cancelled"],
  accepted: ["in_preparation", "cancelled"],
  in_preparation: ["in_delivery", "cancelled"],
  in_delivery: ["delivered"],
  // Sans matériel prêté, la commande peut se terminer dès la livraison.
  delivered: ["awaiting_equipment_return", "completed"],
  awaiting_equipment_return: ["completed"],
  completed: [],
  cancelled: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean =>
  (ORDER_TRANSITIONS[from] ?? []).includes(to);

// L'annulation après contact client doit toujours être motivée.
export const requiresContactAndReason = (to: OrderStatus): boolean =>
  to === "cancelled";

export const isOrderStatus = (value: string): value is OrderStatus =>
  value in ORDER_TRANSITIONS;
