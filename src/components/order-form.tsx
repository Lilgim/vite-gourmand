"use client";

import { useActionState, useState } from "react";
import { FormField } from "@/components/form-field";
import {
  computePriceDetail,
  DISCOUNT_PEOPLE_THRESHOLD,
  formatEuros,
  isDeliveryFree,
} from "@/lib/pricing";
import { type FormState, initialFormState } from "@/lib/validation";

export type OrderFormDefaults = {
  peopleCount?: number;
  eventDate?: string;
  eventTime?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  distanceKm?: number;
};

type OrderFormProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  hiddenFieldName: "menu_id" | "order_id";
  hiddenFieldValue: number;
  minPeople: number;
  pricePerPerson: number;
  defaults: OrderFormDefaults;
  submitLabel: string;
  pendingLabel: string;
};

// Formulaire partagé création/modification de commande. Le détail du prix
// est recalculé à chaque saisie et affiché AVANT la validation (exigence
// du sujet) ; le calcul faisant foi reste côté serveur.
export const OrderForm = ({
  action: serverAction,
  hiddenFieldName,
  hiddenFieldValue,
  minPeople,
  pricePerPerson,
  defaults,
  submitLabel,
  pendingLabel,
}: OrderFormProps) => {
  const [state, action, pending] = useActionState(
    serverAction,
    initialFormState,
  );
  const errors = state.status === "error" ? state.errors : undefined;

  const [peopleCount, setPeopleCount] = useState(
    defaults.peopleCount ?? minPeople,
  );
  const [city, setCity] = useState(defaults.city ?? "");
  const [distanceKm, setDistanceKm] = useState(defaults.distanceKm ?? 0);

  const freeDelivery = isDeliveryFree(city);
  const price = computePriceDetail({
    pricePerPerson,
    peopleCount: Number.isFinite(peopleCount) ? peopleCount : 0,
    minPeople,
    city,
    distanceKm: freeDelivery ? 0 : distanceKm,
  });

  return (
    <form action={action} className="mt-6 flex flex-col gap-4" noValidate>
      <input type="hidden" name={hiddenFieldName} value={hiddenFieldValue} />

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      )}
      {state.status === "success" && state.message && (
        <p
          role="status"
          className="rounded-lg bg-badge px-3 py-2 text-sm text-primary"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label
          htmlFor="people_count"
          className="text-[13px] font-medium text-ink"
        >
          Nombre de convives{" "}
          <span aria-hidden="true" className="text-primary">
            *
          </span>
        </label>
        <p id="people_count-hint" className="text-xs text-muted">
          Minimum {minPeople} personnes. Une remise de 10 % s'applique à partir
          de {minPeople + DISCOUNT_PEOPLE_THRESHOLD} convives.
        </p>
        <input
          id="people_count"
          name="people_count"
          type="number"
          min={minPeople}
          required
          value={Number.isFinite(peopleCount) ? peopleCount : ""}
          onChange={(event) => setPeopleCount(event.target.valueAsNumber)}
          aria-describedby="people_count-hint"
          aria-invalid={errors?.people_count ? true : undefined}
          className="rounded-lg border border-line px-3 py-2 focus:outline-2 focus:outline-primary"
        />
        {errors?.people_count?.map((message) => (
          <p key={message} className="text-sm text-red-700">
            {message}
          </p>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Date de l'événement"
          name="event_date"
          type="date"
          required
          defaultValue={defaults.eventDate}
          errors={errors?.event_date}
        />
        <FormField
          label="Heure"
          name="event_time"
          type="time"
          required
          defaultValue={defaults.eventTime}
          errors={errors?.event_time}
        />
      </div>

      <FormField
        label="Adresse du lieu de réception"
        name="event_address"
        required
        autoComplete="street-address"
        defaultValue={defaults.address}
        errors={errors?.event_address}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Code postal"
          name="event_postal_code"
          required
          autoComplete="postal-code"
          defaultValue={defaults.postalCode}
          errors={errors?.event_postal_code}
        />
        <div className="flex flex-col gap-1">
          <label
            htmlFor="event_city"
            className="text-[13px] font-medium text-ink"
          >
            Ville{" "}
            <span aria-hidden="true" className="text-primary">
              *
            </span>
          </label>
          <input
            id="event_city"
            name="event_city"
            required
            autoComplete="address-level2"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            aria-invalid={errors?.event_city ? true : undefined}
            className="rounded-lg border border-line px-3 py-2 focus:outline-2 focus:outline-primary"
          />
          {errors?.event_city?.map((message) => (
            <p key={message} className="text-sm text-red-700">
              {message}
            </p>
          ))}
        </div>
      </div>

      {!freeDelivery && city.trim() !== "" && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="distance_km"
            className="text-[13px] font-medium text-ink"
          >
            Distance depuis notre boutique de Bordeaux (km){" "}
            <span aria-hidden="true" className="text-primary">
              *
            </span>
          </label>
          <p id="distance_km-hint" className="text-xs text-muted">
            Hors Bordeaux, la livraison est facturée 5 € + 0,59 €/km. La
            distance est vérifiée lors de la préparation de la commande.
          </p>
          <input
            id="distance_km"
            name="distance_km"
            type="number"
            min="0"
            max="200"
            step="0.1"
            required
            value={Number.isFinite(distanceKm) ? distanceKm : ""}
            onChange={(event) => setDistanceKm(event.target.valueAsNumber)}
            aria-describedby="distance_km-hint"
            aria-invalid={errors?.distance_km ? true : undefined}
            className="rounded-lg border border-line px-3 py-2 focus:outline-2 focus:outline-primary"
          />
          {errors?.distance_km?.map((message) => (
            <p key={message} className="text-sm text-red-700">
              {message}
            </p>
          ))}
        </div>
      )}

      <FormField
        label="Numéro de GSM pour le jour J"
        name="phone"
        type="tel"
        required
        autoComplete="tel"
        defaultValue={defaults.phone}
        errors={errors?.phone}
      />

      {/* Détail du prix avant validation */}
      <section
        aria-label="Détail du prix"
        aria-live="polite"
        className="rounded-[10px] border border-line bg-badge p-4 text-sm"
      >
        <h2 className="font-bold">Détail du prix</h2>
        <dl className="mt-2 space-y-1">
          <div className="flex justify-between">
            <dt>
              Menu ({formatEuros(pricePerPerson)} ×{" "}
              {Number.isFinite(peopleCount) ? peopleCount : 0} convives)
            </dt>
            <dd>{formatEuros(price.basePrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Remise fidélité (10 %)</dt>
            <dd>
              {price.discountApplied
                ? `− ${formatEuros(price.discountAmount)}`
                : "Non applicable"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Livraison{freeDelivery ? " (offerte à Bordeaux)" : ""}</dt>
            <dd>
              {price.deliveryFee === 0
                ? "Offerte"
                : formatEuros(price.deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-bold">
            <dt>Total</dt>
            <dd>{formatEuros(price.totalPrice)}</dd>
          </div>
        </dl>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
};
