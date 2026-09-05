import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { StudioIntro } from "@/components/sections/StudioIntro";
import { Capabilities } from "@/components/sections/Capabilities";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { MaterialStudy } from "@/components/sections/MaterialStudy";
import { ContactCta } from "@/components/sections/ContactCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  description:
    "Stilio is a Paris interior design studio. Walk an interactive 3D interior, change the light and materials, then start a project with the studio.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Hero />
      <StudioIntro />
      <Capabilities />
      <FeaturedProjects />
      <MaterialStudy />
      <ContactCta />
    </>
  );
}
