import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { brand } from "@/lib/tokens";
import { photos } from "@/lib/photography";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${brand.domain}`),
  title: {
    default: "Stilio — Interior Design & Renovation Studio in Amman",
    template: "%s · Stilio",
  },
  description:
    "Stilio is an interior design and renovation studio in Amman, Jordan. Explore an interactive 3D interior, change the light and materials, then start a project with the studio.",
  authors: [{ name: brand.legalName }],
  openGraph: {
    type: "website",
    siteName: "Stilio",
    title: "Stilio — Interior Design & Renovation Studio in Amman",
    description:
      "Amman interior design and renovation — an interactive 3D interior, a real material library, and a studio that stays on site to the last light.",
    locale: "en_GB",
    images: [
      {
        url: photos.livingScandiCalm.src,
        width: photos.livingScandiCalm.width,
        height: photos.livingScandiCalm.height,
        alt: photos.livingScandiCalm.alt,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F3EFE6",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-[color:var(--color-onyx)] focus:px-4 focus:py-2 focus:text-[color:var(--color-marble)]"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
