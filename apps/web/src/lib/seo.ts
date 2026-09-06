/**
 * SEO helpers — one place that knows how a page's metadata, canonical URL and
 * social preview are built, so every route stays unique and consistent instead
 * of silently inheriting the homepage's title/description/image.
 */
import type { Metadata } from "next";
import { brand } from "@/lib/tokens";
import { photos, type Photo } from "@/lib/photography";
import { projects } from "@/lib/projects";

export const SITE_URL = `https://${brand.domain}`;

export function absoluteUrl(path: string): string {
  if (path === "/" || path === "") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Build a page's `Metadata`: unique title/description, a canonical link (Next
 * never emits one unless told to), and matching OpenGraph/Twitter previews so
 * the page doesn't inherit the root layout's homepage-flavoured social card.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  /** A real photo from the archive — reused as-is so the OG image always matches an actual asset and its true dimensions. */
  image?: Photo;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: path === "" ? "/" : path },
    openGraph: {
      type: "website",
      url,
      siteName: brand.name,
      title,
      description,
      images: image
        ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.src] : undefined,
    },
  };
}

/** Real service locations, drawn from HQ + the portfolio actually shown on /projects — never invented. */
export const serviceAreas = Array.from(
  new Set([brand.address.city, ...projects.map((p) => p.location.split(",")[0]!.trim())]),
);

const realServices = [
  { name: "Interior Design", description: "Concept, spatial planning, joinery detailing, furniture and styling." },
  { name: "Renovation", description: "Structural changes, services, finishes and site management." },
  { name: "Material & Lighting Design", description: "A resolved palette of stone, timber and textile, with a four-layer lighting design." },
  { name: "3D Interior Visualisation", description: "Every scheme modelled before a wall moves, walkable in the right light." },
];

/**
 * Organization / ProfessionalService structured data for the studio itself.
 * Only fields backed by real content in `lib/tokens.ts` and the live pages —
 * no fabricated ratings, reviews or social handles.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@id": `${SITE_URL}/#organization`,
    // No single schema.org type maps exactly to "interior design studio" —
    // ProfessionalService (design services) + HomeAndConstructionBusiness
    // (renovation) together describe what Stilio actually does.
    "@type": ["ProfessionalService", "HomeAndConstructionBusiness"],
    name: brand.legalName,
    alternateName: brand.name,
    url: SITE_URL,
    logo: absoluteUrl("/brand/logo-on-white.jpg"),
    image: absoluteUrl(photos.livingScandiCalm.src),
    description:
      "Interior design and renovation studio — spatial planning, material and lighting design, and end-to-end delivery.",
    email: brand.email,
    telephone: brand.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      // only include street/postcode when they're actually set
      ...(brand.address.line1
        ? { streetAddress: [brand.address.line1, brand.address.line2].filter(Boolean).join(", ") }
        : {}),
      ...(brand.address.postcode ? { postalCode: brand.address.postcode } : {}),
      addressLocality: brand.address.city,
      addressCountry: brand.address.country,
    },
    areaServed: serviceAreas.map((name) => ({ "@type": "City", name })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Studio services",
      itemListElement: realServices.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name, description: s.description },
      })),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
