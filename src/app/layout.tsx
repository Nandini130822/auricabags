import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Marcellus } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", weight: ["300", "400", "500", "600"] });
const marcellus = Marcellus({ subsets: ["latin"], variable: "--font-marcellus", weight: "400" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Aurica Bags — Occasion Clutches, Potlis & Handbags", template: "%s · Aurica Bags" },
  description:
    "Statement clutches, potli bags and handbags for weddings, receptions and every celebration. Luxury looks without the luxury price — from Surat, shipped across India.",
  openGraph: { siteName: "Aurica Bags", type: "website", locale: "en_IN" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${marcellus.variable} ${cormorant.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
