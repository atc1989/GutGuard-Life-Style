import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./lifestyle-ui.css";

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
  themeColor: "#F4F1EA",
  colorScheme: "light",
};

const BONE = "#F4F1EA";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable}`}
      style={{ backgroundColor: BONE, colorScheme: "light" }}
    >
      <body className="gg-surface" style={{ backgroundColor: BONE }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
