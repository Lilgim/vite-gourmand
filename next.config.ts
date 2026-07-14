import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixe la racine du projet : un lockfile parasite existe plus haut dans l'arborescence
  turbopack: { root: __dirname },
};

export default nextConfig;
