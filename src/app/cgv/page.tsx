import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
};

export default function CgvPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Conditions générales de vente</h1>

      <section aria-labelledby="cgv-commande" className="mt-8">
        <h2 id="cgv-commande" className="text-xl font-bold">
          1. Commandes
        </h2>
        <p className="mt-3 text-zinc-700">
          Les commandes s'effectuent en ligne depuis un compte client. Chaque
          menu impose un nombre minimum de personnes, indiqué sur sa fiche. Le
          détail complet du prix (menu, remise éventuelle, frais de livraison)
          est affiché avant la validation définitive de la commande.
        </p>
        <p className="mt-3 text-zinc-700">
          Une commande peut être modifiée ou annulée par le client tant qu'elle
          n'a pas été acceptée par nos équipes, à l'exception du menu choisi qui
          ne peut pas être changé. Après acceptation, toute modification ou
          annulation s'effectue avec notre service client, qui en conserve le
          motif et le mode de contact.
        </p>
      </section>

      <section aria-labelledby="cgv-prix" className="mt-8">
        <h2 id="cgv-prix" className="text-xl font-bold">
          2. Prix, remise et livraison
        </h2>
        <p className="mt-3 text-zinc-700">
          Les prix sont exprimés en euros, toutes taxes comprises, par personne.
          Une remise de 10 % s'applique automatiquement lorsque le nombre de
          convives dépasse d'au moins 5 personnes le minimum du menu.
        </p>
        <p className="mt-3 text-zinc-700">
          La livraison est offerte dans Bordeaux. En dehors de Bordeaux, les
          frais de livraison s'élèvent à 5 € auxquels s'ajoutent 0,59 € par
          kilomètre entre notre boutique et le lieu de réception, calculés sur
          la distance routière estimée au moment de la commande.
        </p>
      </section>

      <section aria-labelledby="cgv-statuts" className="mt-8">
        <h2 id="cgv-statuts" className="text-xl font-bold">
          3. Suivi de commande
        </h2>
        <p className="mt-3 text-zinc-700">
          Chaque commande suit les étapes suivantes, consultables à tout moment
          avec leur horodatage depuis l'espace client : acceptée, en
          préparation, en cours de livraison, livrée, en attente du retour de
          matériel, terminée.
        </p>
      </section>

      <section aria-labelledby="cgv-materiel" className="mt-8">
        <h2 id="cgv-materiel" className="text-xl font-bold">
          4. Matériel mis à disposition
        </h2>
        <p className="mt-3 text-zinc-700">
          Le matériel de réception (vaisselle, nappage, matériel de service)
          reste la propriété de Vite &amp; Gourmand et doit être restitué après
          l'événement.{" "}
          <strong>
            À défaut de restitution dans un délai de dix jours ouvrés après la
            livraison, une indemnité forfaitaire de 600 € est facturée au
            client.
          </strong>{" "}
          La commande reste au statut « en attente du retour de matériel »
          jusqu'à restitution complète.
        </p>
      </section>

      <section aria-labelledby="cgv-avis" className="mt-8">
        <h2 id="cgv-avis" className="text-xl font-bold">
          5. Avis clients
        </h2>
        <p className="mt-3 text-zinc-700">
          Après une commande terminée, le client peut déposer un avis noté de 1
          à 5. Les avis sont relus par nos équipes avant publication ; seuls les
          avis validés apparaissent sur le site.
        </p>
      </section>

      <section aria-labelledby="cgv-mediation" className="mt-8">
        <h2 id="cgv-mediation" className="text-xl font-bold">
          6. Litiges
        </h2>
        <p className="mt-3 text-zinc-700">
          En cas de litige, une solution amiable sera recherchée en priorité. À
          défaut, le client peut recourir gratuitement à un médiateur de la
          consommation. Les présentes conditions sont soumises au droit
          français.
        </p>
      </section>
    </div>
  );
}
