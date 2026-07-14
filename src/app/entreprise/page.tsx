import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "L'entreprise",
  description:
    "Découvrez Vite & Gourmand, traiteur artisanal bordelais : notre histoire, nos valeurs et notre équipe.",
};

export default function EntreprisePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Vite &amp; Gourmand, traiteur bordelais
      </h1>

      <section aria-labelledby="titre-histoire" className="mt-8">
        <h2 id="titre-histoire" className="text-xl font-bold">
          Notre histoire
        </h2>
        <p className="mt-3 text-zinc-700">
          Fondée en 2015 au cœur de Bordeaux, Vite &amp; Gourmand est née de
          l'envie de faire voyager la cuisine du Sud-Ouest sur les tables des
          grands événements. D'abord spécialisée dans les cocktails
          d'entreprise, la maison accompagne aujourd'hui mariages, anniversaires
          et réceptions dans toute la métropole.
        </p>
      </section>

      <section aria-labelledby="titre-valeurs" className="mt-8">
        <h2 id="titre-valeurs" className="text-xl font-bold">
          Nos engagements
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-zinc-700">
          <li>
            Des produits frais et de saison, sourcés auprès de producteurs de
            Nouvelle-Aquitaine.
          </li>
          <li>
            Des menus adaptés à tous les régimes : classique, végétarien, végan
            et sans gluten.
          </li>
          <li>Une information claire sur les allergènes de chaque plat.</li>
          <li>Une livraison soignée à Bordeaux et dans toute la métropole.</li>
        </ul>
      </section>

      <section aria-labelledby="titre-equipe" className="mt-8">
        <h2 id="titre-equipe" className="text-xl font-bold">
          L'équipe
        </h2>
        <p className="mt-3 text-zinc-700">
          Autour du chef fondateur, une brigade de cuisiniers, pâtissiers et
          maîtres d'hôtel prépare et sert chaque réception. C'est cette même
          équipe qui répond à vos demandes, prépare vos commandes et assure le
          suivi jusqu'à la récupération du matériel.
        </p>
      </section>
    </div>
  );
}
