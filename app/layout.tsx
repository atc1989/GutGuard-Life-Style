import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

/** Paper hex fallback so the first paint is never UA-default or brand blue before CSS. */
const PAPER = "#FCFAF5";
const canvasStyle = { backgroundColor: `var(--paper, ${PAPER})` };

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

export const metadata: Metadata = {
  title: "Gutguard Lifestyle",
  description:
    "Gutguard Lifestyle — Ginhawa funnel, member card, and daily protocol.",
};

export const viewport: Viewport = {
  themeColor: PAPER,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable}`}
      style={canvasStyle}
    >
      <body className="gg-surface" style={canvasStyle}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
