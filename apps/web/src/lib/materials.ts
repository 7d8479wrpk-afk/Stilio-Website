import { photos } from "@/lib/photography";

export type PhotoKey = keyof typeof photos;

export type MaterialCategory =
  | "Wood"
  | "Stone"
  | "Marble"
  | "Fabric"
  | "Metal"
  | "Glass"
  | "Tile"
  | "Paint";

export interface Material {
  slug: string;
  name: string;
  category: MaterialCategory;
  /** e.g. "European oak, rift-sawn" */
  type: string;
  texture: string;
  usage: string;
  styles: string[];
  /** Approximate colour for swatches and 3D preview. */
  swatch: string;
  /** A room from the studio archive where this material carries the scheme. */
  photo: PhotoKey;
  /** The material's swatch plus the tones it is happiest beside — 4 in all. */
  palette: string[];
  /** Whether this material can be dropped into the 3D scene. */
  previewable: boolean;
  /** Maps to a scene surface / furniture channel when previewable. */
  previewTarget?: "floor" | "sofa" | "table" | "wall" | "rug";
}

export const materialCategories: MaterialCategory[] = [
  "Wood",
  "Stone",
  "Marble",
  "Fabric",
  "Metal",
  "Glass",
  "Tile",
  "Paint",
];

export const materials: Material[] = [
  // Wood
  {
    slug: "rift-oak",
    name: "Rift White Oak",
    category: "Wood",
    type: "European oak, rift-sawn, hard-wax oil",
    texture: "Straight, quiet grain; matte, warm to the touch",
    usage: "Flooring, wall panelling, joinery fronts",
    styles: ["Warm Contemporary", "Japandi", "Minimal"],
    swatch: "#C9A46F",
    photo: "bedroomWarmOak",
    palette: ["#C9A46F", "#EDE4D3", "#8C6F53", "#2E2A23"],
    previewable: true,
    previewTarget: "floor",
  },
  {
    slug: "smoked-walnut",
    name: "Smoked Walnut",
    category: "Wood",
    type: "American walnut, fumed, low-sheen lacquer",
    texture: "Deep chocolate figure with amber lights",
    usage: "Feature joinery, tables, headboard walls",
    styles: ["Warm Contemporary", "Luxury Contemporary"],
    swatch: "#5A4231",
    photo: "kitchenWalnutBlackHood",
    palette: ["#5A4231", "#B0894C", "#E4D8C3", "#16140F"],
    previewable: true,
    previewTarget: "table",
  },
  {
    slug: "pale-ash",
    name: "Pale Ash",
    category: "Wood",
    type: "Olive ash, cerused, matte",
    texture: "Open grain filled white; soft, chalky surface",
    usage: "Cabinetry, shelving, bed frames",
    styles: ["Japandi", "Organic Modern", "Minimal"],
    swatch: "#D8C6A8",
    photo: "livingScandiCalm",
    palette: ["#D8C6A8", "#F3EFE6", "#DAD0BE", "#9A9080"],
    previewable: false,
  },
  // Stone
  {
    slug: "grey-limestone",
    name: "Grey Limestone",
    category: "Stone",
    type: "French limestone, honed",
    texture: "Fine, even matte; cool grey with faint shell",
    usage: "Entry floors, staircases, bathroom walls",
    styles: ["Contemporary", "Luxury Minimal"],
    swatch: "#B9B4AB",
    photo: "entryStoneStair",
    palette: ["#B9B4AB", "#EDE4D3", "#7A756C", "#2E2C2A"],
    previewable: true,
    previewTarget: "floor",
  },
  {
    slug: "travertine-classic",
    name: "Roman Travertine",
    category: "Stone",
    type: "Cross-cut travertine, filled and honed",
    texture: "Warm ivory with linear vein and soft pitting",
    usage: "Coffee tables, plinths, cladding",
    styles: ["Warm Contemporary", "Organic Modern", "Minimal"],
    swatch: "#E4D8C3",
    photo: "livingMarbleLounge",
    palette: ["#E4D8C3", "#C9A46F", "#8C6F53", "#F3EFE6"],
    previewable: true,
    previewTarget: "table",
  },
  {
    slug: "basalt",
    name: "Honed Basalt",
    category: "Stone",
    type: "Volcanic basalt, honed",
    texture: "Dense, near-black, uniform matte",
    usage: "Hearths, thresholds, exterior continuity",
    styles: ["Contemporary", "Minimal"],
    swatch: "#3B3A38",
    photo: "livingMinimalBlackArt",
    palette: ["#3B3A38", "#B9B4AB", "#E4D8C3", "#16140F"],
    previewable: false,
  },
  // Marble
  {
    slug: "calacatta-viola",
    name: "Calacatta Viola",
    category: "Marble",
    type: "Italian marble, book-matched, honed",
    texture: "Warm white ground with aubergine and gold veining",
    usage: "Feature walls, island tops — one surface per room",
    styles: ["Luxury Contemporary", "Luxury Minimal"],
    swatch: "#D8CFC6",
    photo: "kitchenMarbleIsland",
    palette: ["#D8CFC6", "#7A5C6B", "#B0894C", "#2E2A23"],
    previewable: true,
    previewTarget: "wall",
  },
  {
    slug: "crema-onyx",
    name: "Crema Onyx",
    category: "Marble",
    type: "Backlit onyx, resin-stabilised",
    texture: "Translucent honey layers; glows when lit from behind",
    usage: "Backlit niches, bar fronts, headboards",
    styles: ["Luxury Contemporary"],
    swatch: "#CBB07B",
    photo: "bedroomCharcoalGoldBranch",
    palette: ["#CBB07B", "#7A5A2E", "#EDE0C4", "#2E2A23"],
    previewable: false,
  },
  // Fabric
  {
    slug: "belgian-linen",
    name: "Belgian Linen",
    category: "Fabric",
    type: "Heavyweight upholstery linen, 480 g/m²",
    texture: "Slubby, matte, softens with use",
    usage: "Sofas, headboards, loose covers",
    styles: ["Warm Contemporary", "Organic Modern", "Minimal"],
    swatch: "#C7BAA3",
    photo: "livingWarmMinimal",
    palette: ["#C7BAA3", "#F3EFE6", "#9A6A44", "#2E2A23"],
    previewable: true,
    previewTarget: "sofa",
  },
  {
    slug: "mohair-velvet",
    name: "Mohair Velvet",
    category: "Fabric",
    type: "Mohair-blend velvet, dense pile",
    texture: "Short, dry pile with a subtle sheen shift",
    usage: "Lounge chairs, ottomans, accent seating",
    styles: ["Luxury Contemporary", "Warm Contemporary"],
    swatch: "#8C6F53",
    photo: "livingPenthouseWarm",
    palette: ["#8C6F53", "#B0894C", "#E4D8C3", "#16140F"],
    previewable: true,
    previewTarget: "sofa",
  },
  {
    slug: "boucle-wool",
    name: "Wool Bouclé",
    category: "Fabric",
    type: "Undyed wool bouclé",
    texture: "Looped, nubby, highly tactile",
    usage: "Curved chairs, small sofas, bench tops",
    styles: ["Organic Modern", "Japandi"],
    swatch: "#DAD0BE",
    photo: "livingBrightAiry",
    palette: ["#DAD0BE", "#F3EFE6", "#B9B4AB", "#6E675A"],
    previewable: true,
    previewTarget: "sofa",
  },
  {
    slug: "saddle-leather",
    name: "Saddle Leather",
    category: "Fabric",
    type: "Full-grain vegetable-tanned leather",
    texture: "Firm, waxy, develops a patina",
    usage: "Armchairs, bench seats, strap details",
    styles: ["Warm Contemporary", "Contemporary"],
    swatch: "#9A6A44",
    photo: "officeExecutive",
    palette: ["#9A6A44", "#C9A46F", "#2E2A23", "#E4D8C3"],
    previewable: true,
    previewTarget: "sofa",
  },
  // Metal
  {
    slug: "brushed-brass",
    name: "Brushed Brass",
    category: "Metal",
    type: "Solid brass, brushed, unlacquered",
    texture: "Warm gold with a soft directional grain; ages gracefully",
    usage: "Hardware, light fittings, table frames",
    styles: ["Warm Contemporary", "Luxury Contemporary", "Organic Modern"],
    swatch: "#B0894C",
    photo: "diningClusterChandelier",
    palette: ["#B0894C", "#CBAE7B", "#2E2A23", "#F3EFE6"],
    previewable: false,
  },
  {
    slug: "patinated-bronze",
    name: "Patinated Bronze",
    category: "Metal",
    type: "Cast bronze, dark chemical patina, waxed",
    texture: "Deep brown-black with warm high points",
    usage: "Pivot doors, fireplace surrounds, feature legs",
    styles: ["Luxury Contemporary", "Contemporary"],
    swatch: "#4A3B2E",
    photo: "entryBronzePortal",
    palette: ["#4A3B2E", "#B0894C", "#D8CFBE", "#16140F"],
    previewable: false,
  },
  {
    slug: "blackened-steel",
    name: "Blackened Steel",
    category: "Metal",
    type: "Mild steel, hot-blackened, oiled",
    texture: "Matte grey-black with faint mottling",
    usage: "Slim shelving, table bases, screens",
    styles: ["Contemporary", "Minimal"],
    swatch: "#2E2C2A",
    photo: "staircaseFloatingLed",
    palette: ["#2E2C2A", "#B9B4AB", "#C9A46F", "#F3EFE6"],
    previewable: false,
  },
  // Glass
  {
    slug: "reeded-glass",
    name: "Reeded Glass",
    category: "Glass",
    type: "Low-iron glass, fluted profile",
    texture: "Vertical ripple; blurs what is behind it",
    usage: "Cabinet fronts, partitions, shower screens",
    styles: ["Warm Contemporary", "Contemporary"],
    swatch: "#DDE3E0",
    photo: "officeArchFeature",
    palette: ["#DDE3E0", "#F3EFE6", "#B9B4AB", "#8C8F8C"],
    previewable: false,
  },
  {
    slug: "bronze-mirror",
    name: "Bronze Mirror",
    category: "Glass",
    type: "Antique-tint mirror glass",
    texture: "Warm, slightly dimmed reflection",
    usage: "Alcoves, wardrobe doors, ceiling insets",
    styles: ["Luxury Contemporary"],
    swatch: "#7A6A55",
    photo: "entryGardenStair",
    palette: ["#7A6A55", "#B0894C", "#2E2A23", "#E4D8C3"],
    previewable: false,
  },
  // Tile
  {
    slug: "zellige-bone",
    name: "Zellige, Bone",
    category: "Tile",
    type: "Hand-formed glazed terracotta, 10×10",
    texture: "Uneven, glossy, each tile slightly different",
    usage: "Kitchen splashbacks, bath niches, hearths",
    styles: ["Organic Modern", "Mediterranean", "Warm Contemporary"],
    swatch: "#E7E0D2",
    photo: "kitchenSkylightHex",
    palette: ["#E7E0D2", "#F3EFE6", "#C9A46F", "#7A756C"],
    previewable: false,
  },
  {
    slug: "microcement-clay",
    name: "Microcement, Clay",
    category: "Tile",
    type: "Trowelled microcement, sealed matte",
    texture: "Seamless, cloudy, hand-worked",
    usage: "Wet rooms, floors, curved walls",
    styles: ["Minimal", "Organic Modern", "Contemporary"],
    swatch: "#CBB79E",
    photo: "bathroomWoodVanity",
    palette: ["#CBB79E", "#EDE4D3", "#8C6F53", "#3B3A38"],
    previewable: false,
  },
  // Paint
  {
    slug: "soft-almond",
    name: "Soft Almond",
    category: "Paint",
    type: "Mineral emulsion, dead matte",
    texture: "Chalky, absorbs light, no sheen",
    usage: "Walls and ceilings — the studio's default warm white",
    styles: ["Warm Contemporary", "Japandi", "Minimal", "Organic Modern"],
    swatch: "#EDE4D3",
    photo: "livingBrightAiry",
    palette: ["#EDE4D3", "#F3EFE6", "#D8CFBE", "#C9A46F"],
    previewable: true,
    previewTarget: "wall",
  },
  {
    slug: "espresso-limewash",
    name: "Espresso Limewash",
    category: "Paint",
    type: "Limewash, two coats, unsealed",
    texture: "Cloudy, matte, moves with the light",
    usage: "Feature walls, headboard walls, studies",
    styles: ["Warm Contemporary", "Contemporary"],
    swatch: "#2E2A23",
    photo: "bedroomCharcoalSputnik",
    palette: ["#2E2A23", "#16140F", "#B0894C", "#D8CFBE"],
    previewable: true,
    previewTarget: "wall",
  },
];
