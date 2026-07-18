import { describe, expect, test } from "bun:test";
import {
  computePriceDetail,
  DISCOUNT_PEOPLE_THRESHOLD,
  isDeliveryFree,
} from "@/lib/pricing";

describe("computePriceDetail — règles du sujet", () => {
  test("prix de base = prix par personne × convives", () => {
    const price = computePriceDetail({
      pricePerPerson: 38,
      peopleCount: 10,
      minPeople: 10,
      city: "Bordeaux",
      distanceKm: 0,
    });
    expect(price.basePrice).toBe(380);
    expect(price.totalPrice).toBe(380);
  });

  test("remise de 10 % si convives ≥ minimum + 5", () => {
    const price = computePriceDetail({
      pricePerPerson: 38,
      peopleCount: 15,
      minPeople: 10,
      city: "Bordeaux",
      distanceKm: 0,
    });
    expect(price.discountApplied).toBe(true);
    expect(price.discountAmount).toBe(57);
    expect(price.totalPrice).toBe(513);
  });

  test("pas de remise à minimum + 4 (seuil strict)", () => {
    const price = computePriceDetail({
      pricePerPerson: 38,
      peopleCount: 10 + DISCOUNT_PEOPLE_THRESHOLD - 1,
      minPeople: 10,
      city: "Bordeaux",
      distanceKm: 0,
    });
    expect(price.discountApplied).toBe(false);
    expect(price.discountAmount).toBe(0);
  });

  test("livraison offerte à Bordeaux, insensible à la casse et aux espaces", () => {
    expect(isDeliveryFree("Bordeaux")).toBe(true);
    expect(isDeliveryFree("  bordeaux ")).toBe(true);
    expect(isDeliveryFree("BORDEAUX")).toBe(true);
    expect(isDeliveryFree("Le Bouscat")).toBe(false);
  });

  test("livraison hors Bordeaux : 5 € + 0,59 €/km", () => {
    const price = computePriceDetail({
      pricePerPerson: 24,
      peopleCount: 20,
      minPeople: 20,
      city: "Le Bouscat",
      distanceKm: 4.5,
    });
    expect(price.deliveryFee).toBe(7.66);
    expect(price.totalPrice).toBe(487.66);
  });

  test("arrondi monétaire en centimes entiers (pas d'artefact IEEE 754)", () => {
    // 5 + 0,59 × 4,5 = 7,655 → 7,66 (et non 7,65 par erreur flottante)
    const price = computePriceDetail({
      pricePerPerson: 10,
      peopleCount: 1,
      minPeople: 1,
      city: "Pessac",
      distanceKm: 4.5,
    });
    expect(price.deliveryFee).toBe(7.66);
  });

  test("cumul remise + livraison", () => {
    const price = computePriceDetail({
      pricePerPerson: 65,
      peopleCount: 35,
      minPeople: 30,
      city: "Pessac",
      distanceKm: 8,
    });
    expect(price.basePrice).toBe(2275);
    expect(price.discountAmount).toBe(227.5);
    expect(price.deliveryFee).toBe(9.72);
    expect(price.totalPrice).toBe(2057.22);
  });

  test("la distance est ignorée quand la livraison est offerte", () => {
    const price = computePriceDetail({
      pricePerPerson: 30,
      peopleCount: 10,
      minPeople: 10,
      city: "Bordeaux",
      distanceKm: 50,
    });
    expect(price.deliveryFee).toBe(0);
  });
});
