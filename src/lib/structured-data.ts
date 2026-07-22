import type { OpeningHour } from "@/lib/queries/home";
import type { MenuDetail } from "@/lib/queries/menus";

// Données Schema.org (JSON-LD) : lues par Google (rich results) et par les
// agents IA. Source unique des informations publiques de l'entreprise.

const SITE_URL = (
  process.env.APP_URL ?? "https://vite-gourmand.lilgim.cloud"
).replace(/\/$/, "");

const COMPANY = {
  name: "Vite & Gourmand",
  description:
    "Traiteur bordelais depuis 2015 : menus sur mesure pour mariages, anniversaires et événements d'entreprise, livrés à Bordeaux et dans sa métropole.",
  street: "18 rue des Faussets",
  postalCode: "33000",
  city: "Bordeaux",
  country: "FR",
  phone: "+33556000000",
  email: "contact@vite-gourmand.example",
  foundingYear: "2015",
} as const;

// day_of_week : 0 = Lundi … 6 = Dimanche (voir DAY_NAMES).
const SCHEMA_DAYS = [
  "https://schema.org/Monday",
  "https://schema.org/Tuesday",
  "https://schema.org/Wednesday",
  "https://schema.org/Thursday",
  "https://schema.org/Friday",
  "https://schema.org/Saturday",
  "https://schema.org/Sunday",
] as const;

export const cateringBusinessJsonLd = (
  hours: OpeningHour[],
  reviews: { rating: number }[],
): Record<string, unknown> => {
  const openingHoursSpecification = hours
    .filter((hour) => !hour.is_closed && hour.open_time && hour.close_time)
    .map((hour) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAYS[hour.day_of_week],
      opens: (hour.open_time as string).slice(0, 5),
      closes: (hour.close_time as string).slice(0, 5),
    }));

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Caterer",
    name: COMPANY.name,
    description: COMPANY.description,
    url: SITE_URL,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    foundingDate: COMPANY.foundingYear,
    priceRange: "€€",
    servesCuisine: "Française",
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressCountry: COMPANY.country,
    },
    areaServed: { "@type": "City", name: "Bordeaux" },
    openingHoursSpecification,
  };

  if (reviews.length > 0) {
    const average =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: average.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return data;
};

export const menuProductJsonLd = (
  menu: MenuDetail,
  imageUrl?: string,
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: menu.title,
  description: menu.description,
  category: menu.theme,
  ...(imageUrl ? { image: `${SITE_URL}${imageUrl}` } : {}),
  offers: {
    "@type": "Offer",
    price: Number(menu.price_per_person).toFixed(2),
    priceCurrency: "EUR",
    availability:
      menu.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    url: `${SITE_URL}/menus/${menu.id}`,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: Number(menu.price_per_person).toFixed(2),
      priceCurrency: "EUR",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitText: "personne",
      },
    },
  },
});
