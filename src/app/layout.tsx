import type { Metadata } from "next";
import { Fraunces, Jost, Marcellus } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config";

// Body text
const jost = Jost({ subsets: ["latin"], variable: "--font-jost", weight: ["300", "400", "500", "600"] });
// Logo wordmark only (matches the Aurica logo lettering)
const marcellus = Marcellus({ subsets: ["latin"], variable: "--font-marcellus", weight: "400" });
// Headings + italic accents: premium serif with sturdy, even strokes (readable at every size)
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
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
    <html lang="en" className={`${jost.variable} ${marcellus.variable} ${fraunces.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
