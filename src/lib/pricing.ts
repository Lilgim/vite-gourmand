// Règles de prix du sujet — fonctions pures, partagées entre le client
// (affichage du détail avant validation) et le serveur (calcul faisant foi).
//
// 1. Prix de base : prix par personne × nombre de convives.
// 2. Réduction de 10 % si le nombre de convives dépasse d'au moins 5
//    le minimum du menu.
// 3. Livraison : offerte dans Bordeaux ; sinon 5 € + 0,59 € par kilomètre
//    entre la boutique et le lieu de réception (distance déclarée à la
//    commande, règle documentée dans les CGV).

export const DISCOUNT_RATE = 0.1;
export const DISCOUNT_PEOPLE_THRESHOLD = 5;
export const DELIVERY_BASE_FEE = 5;
export const DELIVERY_FEE_PER_KM = 0.59;
export const FREE_DELIVERY_CITY = "bordeaux";

export type PriceInput = {
  pricePerPerson: number;
  peopleCount: number;
  minPeople: number;
  city: string;
  distanceKm: number;
};

export type PriceDetail = {
  basePrice: number;
  discountApplied: boolean;
  discountAmount: number;
  deliveryFee: number;
  totalPrice: number;
};

// Tous les calculs se font en centimes entiers : les flottants IEEE 754
// produisent des erreurs d'arrondi sur les montants (ex. 7,655 € → 7,65 €
// au lieu de 7,66 €).
const toCents = (euros: number): number => Math.round(euros * 100);

export const isDeliveryFree = (city: string): boolean =>
  city.trim().toLowerCase() === FREE_DELIVERY_CITY;

export const computePriceDetail = ({
  pricePerPerson,
  peopleCount,
  minPeople,
  city,
  distanceKm,
}: PriceInput): PriceDetail => {
  const baseCents = toCents(pricePerPerson) * peopleCount;

  const discountApplied = peopleCount >= minPeople + DISCOUNT_PEOPLE_THRESHOLD;
  const discountCents = discountApplied
    ? Math.round(baseCents * DISCOUNT_RATE)
    : 0;

  const deliveryCents = isDeliveryFree(city)
    ? 0
    : toCents(DELIVERY_BASE_FEE) +
      Math.round(toCents(DELIVERY_FEE_PER_KM) * distanceKm);

  const totalCents = baseCents - discountCents + deliveryCents;

  return {
    basePrice: baseCents / 100,
    discountApplied,
    discountAmount: discountCents / 100,
    deliveryFee: deliveryCents / 100,
    totalPrice: totalCents / 100,
  };
};

export const formatEuros = (value: number): string =>
  `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
