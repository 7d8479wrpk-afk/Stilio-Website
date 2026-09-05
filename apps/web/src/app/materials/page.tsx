import { PageHeader } from "@/components/layout/PageHeader";
import { MaterialLibrary } from "@/components/materials/MaterialLibrary";
import { photos } from "@/lib/photography";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Interior Design Materials & Finishes Library",
  description:
    "The Stilio material library — rift-sawn oak, honed stone, marble, linen and brushed brass, with the coordinated palette each material sits beside.",
  path: "/materials",
  image: photos.kitchenMarbleIsland,
});

export default function MaterialsPage() {
  return (
    <div className="bg-[color:var(--color-canvas)] pb-[var(--section-y)]">
      <PageHeader
        eyebrow="Material library"
        title={<>The palette is the design.</>}
        lede="A deliberately short list. Each material is here because of how it ages, how it feels, and how it sits with warm light — not because it is new."
      />
      <MaterialLibrary />
    </div>
  );
}
