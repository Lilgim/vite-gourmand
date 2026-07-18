import type { NextConfig } from "next";

// En-têtes de sécurité appliqués à toutes les réponses.
// CSP volontairement stricte : pas de script tiers, pas d'iframe,
// images et styles locaux uniquement.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next injecte des styles inline (styled-jsx/Tailwind runtime)
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "script-src 'self' 'unsafe-inline'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Sortie autonome pour l'image Docker de production (node server.js).
  // Conditionnée : `next start` (utilisé par Playwright en local) ne sert
  // pas une build standalone.
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  // Fixe la racine du projet : un lockfile parasite existe plus haut dans l'arborescence
  turbopack: { root: __dirname },
  poweredByHeader: false,
  headers: async () => [{ source: "/(.*)", headers: securityHeaders }],
};

export default nextConfig;
