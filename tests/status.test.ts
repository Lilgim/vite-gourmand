import { describe, expect, test } from "bun:test";
import {
  canTransition,
  isOrderStatus,
  ORDER_TRANSITIONS,
  type OrderStatus,
  requiresContactAndReason,
} from "@/lib/status";

const ALL_STATUSES = Object.keys(ORDER_TRANSITIONS) as OrderStatus[];

describe("machine à états des commandes", () => {
  test("progression nominale du sujet", () => {
    expect(canTransition("submitted", "accepted")).toBe(true);
    expect(canTransition("accepted", "in_preparation")).toBe(true);
    expect(canTransition("in_preparation", "in_delivery")).toBe(true);
    expect(canTransition("in_delivery", "delivered")).toBe(true);
    expect(canTransition("delivered", "awaiting_equipment_return")).toBe(true);
    expect(canTransition("awaiting_equipment_return", "completed")).toBe(true);
  });

  test("sans matériel prêté : livrée peut passer directement à terminée", () => {
    expect(canTransition("delivered", "completed")).toBe(true);
  });

  test("transitions interdites : aucun saut d'étape possible", () => {
    expect(canTransition("submitted", "in_delivery")).toBe(false);
    expect(canTransition("submitted", "completed")).toBe(false);
    expect(canTransition("accepted", "delivered")).toBe(false);
    expect(canTransition("in_preparation", "completed")).toBe(false);
  });

  test("transitions interdites : aucun retour en arrière possible", () => {
    expect(canTransition("accepted", "submitted")).toBe(false);
    expect(canTransition("delivered", "in_preparation")).toBe(false);
    expect(canTransition("completed", "delivered")).toBe(false);
  });

  test("les états finaux n'autorisent aucune transition", () => {
    for (const to of ALL_STATUSES) {
      expect(canTransition("completed", to)).toBe(false);
      expect(canTransition("cancelled", to)).toBe(false);
    }
  });

  test("l'annulation n'est possible qu'avant la livraison", () => {
    expect(canTransition("submitted", "cancelled")).toBe(true);
    expect(canTransition("accepted", "cancelled")).toBe(true);
    expect(canTransition("in_preparation", "cancelled")).toBe(true);
    expect(canTransition("in_delivery", "cancelled")).toBe(false);
    expect(canTransition("delivered", "cancelled")).toBe(false);
  });

  test("l'annulation exige mode de contact et motif", () => {
    expect(requiresContactAndReason("cancelled")).toBe(true);
    expect(requiresContactAndReason("accepted")).toBe(false);
    expect(requiresContactAndReason("completed")).toBe(false);
  });

  test("isOrderStatus filtre les valeurs arbitraires", () => {
    expect(isOrderStatus("accepted")).toBe(true);
    expect(isOrderStatus("hacked")).toBe(false);
    expect(isOrderStatus("")).toBe(false);
  });
});
