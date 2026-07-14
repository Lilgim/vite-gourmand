import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vite & Gourmand — Traiteur à Bordeaux",
    template: "%s — Vite & Gourmand",
  },
  description:
    "Vite & Gourmand, traiteur bordelais : menus pour mariages, anniversaires et événements d'entreprise, commande en ligne et livraison.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
