// Rend un bloc JSON-LD Schema.org. Le contenu est sérialisé puis les "<"
// sont échappés : même si une donnée saisie par un employé contenait
// "</script>", aucune balise ne peut sortir du bloc (protection XSS).
export const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    type="application/ld+json"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD échappé (voir ci-dessus)
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);
