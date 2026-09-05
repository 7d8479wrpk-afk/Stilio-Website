/**
 * Brand tokens mirrored for non-CSS consumers (three.js materials, canvas clear
 * color, structured data, etc.). Keep in sync with globals.css `@theme`.
 */
export const palette = {
  onyx: "#16140F",
  espresso: "#2E2A23",
  gold: "#B0894C",
  goldInk: "#7A5C27",
  champagne: "#CBAE7B",
  stone: "#D8CFBE",
  marble: "#F3EFE6",
  canvas: "#F3EFE6",
  surface: "#FBF8F1",
} as const;

export type PaletteKey = keyof typeof palette;

export const brand = {
  name: "Stilio",
  legalName: "Stilio Interior Design & Renovation",
  tagline: "Interior Design & Renovation",
  domain: "stilio.studio",
  email: "studio@stilio.studio",
  phoneDisplay: "+33 1 84 80 12 40",
  phoneHref: "+33184801240",
  address: {
    line1: "18 Rue des Archives",
    line2: "Studio 4",
    city: "Paris",
    postcode: "75004",
    country: "France",
  },
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
} as const;
