import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Mentions légales</h1>

      <section aria-labelledby="titre-editeur" className="mt-8">
        <h2 id="titre-editeur" className="text-xl font-bold">
          Éditeur du site
        </h2>
        <p className="mt-3 text-zinc-700">
          Vite &amp; Gourmand — SARL au capital de 20 000 € (entreprise fictive
          dans le cadre d'un projet pédagogique)
          <br />
          18 rue des Faussets, 33000 Bordeaux
          <br />
          Téléphone : 05 56 00 00 00 — Email : contact@vite-gourmand.example
          <br />
          Directeur de la publication : Antoine Admin
        </p>
      </section>

      <section aria-labelledby="titre-hebergeur" className="mt-8">
        <h2 id="titre-hebergeur" className="text-xl font-bold">
          Hébergement
        </h2>
        <p className="mt-3 text-zinc-700">
          Les coordonnées de l'hébergeur seront précisées lors de la mise en
          production du site.
        </p>
      </section>

      <section aria-labelledby="titre-donnees" className="mt-8">
        <h2 id="titre-donnees" className="text-xl font-bold">
          Données personnelles (RGPD)
        </h2>
        <p className="mt-3 text-zinc-700">
          Les données collectées lors de la création d'un compte ou d'une
          commande (identité, coordonnées, adresse de livraison) servent
          uniquement au traitement des commandes et à la gestion du compte
          client. Elles ne sont ni cédées ni vendues à des tiers, et sont
          conservées pendant la durée de la relation commerciale puis archivées
          selon les obligations légales.
        </p>
        <p className="mt-3 text-zinc-700">
          Conformément au Règlement général sur la protection des données, vous
          disposez d'un droit d'accès, de rectification, d'effacement et de
          portabilité de vos données. Vous pouvez modifier vos informations
          depuis votre compte ou exercer vos droits en écrivant à
          contact@vite-gourmand.example. Vous pouvez également saisir la CNIL
          (cnil.fr).
        </p>
      </section>

      <section aria-labelledby="titre-cookies" className="mt-8">
        <h2 id="titre-cookies" className="text-xl font-bold">
          Cookies
        </h2>
        <p className="mt-3 text-zinc-700">
          Le site utilise un unique cookie technique de session, indispensable
          au fonctionnement de l'espace client. Aucun cookie publicitaire ou de
          mesure d'audience n'est déposé.
        </p>
      </section>
    </div>
  );
}
