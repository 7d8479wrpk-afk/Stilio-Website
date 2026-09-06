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
  email: "info.stiliojo@gmail.com",
  phoneDisplay: "+962 79 966 0966",
  phoneHref: "+962799660966",
  address: {
    line1: "",
    line2: "",
    city: "Amman",
    postcode: "",
    country: "Jordan",
  },
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
} as const;

/** The postal address as display lines, with any empty parts dropped. */
export const addressLines: string[] = [
  brand.address.line1,
  brand.address.line2,
  [brand.address.postcode, brand.address.city].filter(Boolean).join(" "),
  brand.address.country,
].filter((line) => line.trim().length > 0);

/** One-line address, e.g. for meta descriptions. */
export const addressInline = addressLines.join(", ");
