import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Orbitron } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});

const SITE = "World Cup 2026 — Knockout Predictor";
const DESC =
  "Predict every game of the 2026 FIFA World Cup knockout stage, from the Round of 32 to the Final. Pick your champion and share your bracket.";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE,
  description: DESC,
  applicationName: "WC26 Predictor",
  authors: [{ name: "Mahee Nur", url: "https://github.com/maheenur13" }],
  creator: "Mahee Nur",
  keywords: [
    "World Cup 2026",
    "FIFA",
    "knockout",
    "Round of 32",
    "bracket predictor",
  ],
  openGraph: {
    title: SITE,
    description: DESC,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE,
    description: DESC,
  },
};

export const viewport: Viewport = {
  themeColor: "#060418",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${orbitron.variable}`}
    >
      <body>
        <div className="wavefield" aria-hidden="true" />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
