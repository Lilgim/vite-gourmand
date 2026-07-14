// Vérification rapide des règles de prix du sujet.
// Usage : node scripts/check-pricing.ts
// (les tests formels arrivent avec la suite de tests)
import assert from "node:assert/strict";
import { computePriceDetail } from "../src/lib/pricing.ts";

// Cas 1 : Bordeaux, minimum exact → pas de remise, livraison offerte
const c1 = computePriceDetail({
  pricePerPerson: 38,
  peopleCount: 10,
  minPeople: 10,
  city: "Bordeaux",
  distanceKm: 0,
});
assert.equal(c1.basePrice, 380);
assert.equal(c1.discountAmount, 0);
assert.equal(c1.deliveryFee, 0);
assert.equal(c1.totalPrice, 380);

// Cas 2 : min+5 convives → remise 10 %
const c2 = computePriceDetail({
  pricePerPerson: 38,
  peopleCount: 15,
  minPeople: 10,
  city: "bordeaux ",
  distanceKm: 0,
});
assert.equal(c2.discountApplied, true);
assert.equal(c2.discountAmount, 57);
assert.equal(c2.totalPrice, 513);

// Cas 3 : min+4 convives → pas de remise
const c3 = computePriceDetail({
  pricePerPerson: 38,
  peopleCount: 14,
  minPeople: 10,
  city: "Bordeaux",
  distanceKm: 0,
});
assert.equal(c3.discountApplied, false);

// Cas 4 : hors Bordeaux → 5 € + 0,59 €/km
const c4 = computePriceDetail({
  pricePerPerson: 24,
  peopleCount: 20,
  minPeople: 20,
  city: "Le Bouscat",
  distanceKm: 4.5,
});
assert.equal(c4.deliveryFee, 7.66);
assert.equal(c4.totalPrice, 487.66);

// Cas 5 : cumul remise + livraison
const c5 = computePriceDetail({
  pricePerPerson: 65,
  peopleCount: 35,
  minPeople: 30,
  city: "Pessac",
  distanceKm: 8,
});
assert.equal(c5.basePrice, 2275);
assert.equal(c5.discountAmount, 227.5);
assert.equal(c5.deliveryFee, 9.72);
assert.equal(c5.totalPrice, 2057.22);

console.log("Règles de prix : 5/5 cas conformes au sujet.");
