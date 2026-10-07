import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter-tight",
  display: "swap",
});

/** Labels and numbers on the approved member page (Addendum 05). */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gutguard Lifestyle",
  description:
    "Gutguard Lifestyle — Ginhawa funnel, member card, and daily protocol.",
};

export const viewport: Viewport = {
  themeColor: "#FCFAF5",
  colorScheme: "light",
};

const PAPER = "#FCFAF5";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${plexMono.variable}`}
      style={{ backgroundColor: PAPER, colorScheme: "light" }}
    >
      <body className="gg-surface" style={{ backgroundColor: PAPER }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
