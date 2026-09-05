import type { PhotoKey } from "./photography";

export interface Project {
  slug: string;
  name: string;
  location: string;
  year: number;
  style: string;
  scope: string;
  rooms: string[];
  summary: string;
  /** 2–4 paragraphs of narrative for the detail page. */
  story: string[];
  cover: PhotoKey;
  gallery: PhotoKey[];
  facts: { label: string; value: string }[];
}

export const projects: Project[] = [
  {
    slug: "maison-archives",
    name: "Maison Archives",
    location: "Paris, 4e",
    year: 2025,
    style: "Warm Contemporary",
    scope: "Full renovation · 165 m²",
    rooms: ["Living", "Kitchen", "Entry"],
    summary:
      "A Haussmann apartment stripped back to its bones and rebuilt around walnut, linen and a single line of warm light.",
    story: [
      "The brief was quiet: keep the moulding, lose the clutter, make it feel like one continuous material. We re-planned the enfilade so the entry reads straight through to the windows, then wrapped the core in walnut so every door and cabinet disappears into the wall.",
      "Lighting does the heavy lifting. A single recessed channel runs the length of the apartment at 2700K; everything else is lamps. The result is a home that changes character from morning to midnight without a single visible fixture doing the work.",
      "Furniture is deliberately sparse — a linen sofa, two sculptural nesting tables, one lounge chair — so the architecture stays the subject.",
    ],
    cover: "livingPenthouseWarm",
    gallery: ["livingPenthouseWarm", "kitchenWalnutBlackHood", "entryBronzePortal", "livingMediaWallCity"],
    facts: [
      { label: "Duration", value: "9 months" },
      { label: "Palette", value: "Walnut · Linen · Warm white" },
      { label: "Lighting", value: "Single 2700K channel + lamps" },
    ],
  },
  {
    slug: "north-light-house",
    name: "North Light House",
    location: "Copenhagen",
    year: 2025,
    style: "Organic Modern",
    scope: "Interior architecture · 210 m²",
    rooms: ["Living", "Dining", "Bedroom"],
    summary:
      "A north-facing family home where warm oak and soft curves answer the cool Nordic daylight.",
    story: [
      "North light is flat and cool all day. Rather than fight it, we leaned the whole palette warm — honey oak underfoot, oatmeal wool, a plaster wall that catches the low sun — so the coolness reads as calm rather than cold.",
      "Every hard edge in the shared spaces is softened: a curved sofa, rounded thresholds, a dining table with a radiused end. The geometry does the comforting so the colours can stay restrained.",
      "The bedroom wing goes darker and quieter, with a charcoal headboard wall and a single gilt artwork as the room's one warm spark.",
    ],
    cover: "livingScandiCalm",
    gallery: ["livingScandiCalm", "livingWarmMinimal", "diningClusterChandelier", "bedroomCharcoalGoldBranch"],
    facts: [
      { label: "Duration", value: "11 months" },
      { label: "Palette", value: "Honey oak · Oatmeal · Plaster" },
      { label: "Orientation", value: "Due north" },
    ],
  },
  {
    slug: "travertine-penthouse",
    name: "Travertine Penthouse",
    location: "Milan",
    year: 2024,
    style: "Luxury Minimal",
    scope: "Full renovation · 240 m²",
    rooms: ["Living", "Kitchen", "Bathroom"],
    summary:
      "One stone, floor to ceiling — a penthouse designed as a single quarried block with the furniture carved out.",
    story: [
      "The client wanted marble everywhere. We talked them into restraint: one book-matched stone for the living wall and the primary bathroom, honed rather than polished, and warm timber for everything that gets touched.",
      "The kitchen island is a single faceted piece — its angles line up with the sightline from the entry so the first thing you see is the stone edge catching light.",
      "A suspended fireplace anchors the open plan without a chimney breast, keeping the stone wall unbroken.",
    ],
    cover: "livingOpenplanFireplace",
    gallery: ["livingOpenplanFireplace", "livingMarbleLounge", "kitchenSkylightHex", "bathroomStoneTub"],
    facts: [
      { label: "Duration", value: "14 months" },
      { label: "Stone", value: "Single book-matched slab" },
      { label: "Finish", value: "Honed, never polished" },
    ],
  },
  {
    slug: "gallery-apartment",
    name: "Gallery Apartment",
    location: "New York, Tribeca",
    year: 2024,
    style: "Minimal",
    scope: "Refurbishment · 130 m²",
    rooms: ["Living", "Bedroom"],
    summary:
      "A collector's apartment where the walls were designed first and the furniture chosen to disappear.",
    story: [
      "This one started with the art. We set the hanging heights and the wall lengths before a single piece of furniture was specified, then chose low, pale, quiet seating that sits below the eye line.",
      "A recessed oak niche with concealed lighting holds the smaller works and the books; everything else is white plaster and pale herringbone.",
      "The single black canvas in the living room is the loudest thing in the apartment, and that is the point.",
    ],
    cover: "livingMinimalBlackArt",
    gallery: ["livingMinimalBlackArt", "livingBrightAiry", "bedroomCharcoalSputnik", "livingMediaWallCity"],
    facts: [
      { label: "Duration", value: "7 months" },
      { label: "Approach", value: "Walls before furniture" },
      { label: "Seating", value: "Below eye line" },
    ],
  },
  {
    slug: "stone-stair-villa",
    name: "Stone Stair Villa",
    location: "Lisbon",
    year: 2024,
    style: "Contemporary",
    scope: "New build interiors · 320 m²",
    rooms: ["Entry", "Living", "Kitchen"],
    summary:
      "A hillside villa organised around a cantilevered stone staircase and an interior garden that pulls light down three floors.",
    story: [
      "The staircase is the whole house. It cantilevers off a single stone spine, wraps a planted light well, and drops daylight to the lower level through a continuous floor-level light line.",
      "Living spaces are kept deliberately calm so the stair stays the event — pale plaster, warm oak, one deep sofa arrangement facing the garden.",
      "The kitchen sits behind the stair on the same stone, so the architecture reads as one carved mass from the entry.",
    ],
    cover: "entryStoneStair",
    gallery: ["entryStoneStair", "staircaseFloatingLed", "entryGardenStair", "kitchenMarbleIsland"],
    facts: [
      { label: "Duration", value: "18 months" },
      { label: "Feature", value: "Cantilevered stone stair" },
      { label: "Light", value: "Interior garden, 3 floors" },
    ],
  },
  {
    slug: "atelier-nord",
    name: "Atelier Nord",
    location: "Brussels",
    year: 2023,
    style: "Warm Contemporary",
    scope: "Studio & workspace · 190 m²",
    rooms: ["Office", "Meeting"],
    summary:
      "A design studio's own workplace — timber-slat walls, warm task light, and not a single cool-white tube.",
    story: [
      "A workspace can be warm. We clad the perimeter in timber battens, ran indirect warm light behind them, and specified a solid oak table as the centre of gravity for the studio.",
      "Meeting rooms are glazed for daylight but acoustically separated, with a batten ceiling raft that both absorbs sound and hides the services.",
      "The palette is the same one we use in homes — warm neutrals, oak, one charcoal — because people spend more waking hours here than anywhere else.",
    ],
    cover: "officeExecutive",
    gallery: ["officeExecutive", "officeMeetingWood", "officeArchFeature"],
    facts: [
      { label: "Duration", value: "6 months" },
      { label: "Light", value: "Indirect, 3000K, no tubes" },
      { label: "Centre", value: "One solid oak table" },
    ],
  },
  {
    slug: "bronze-hall-residence",
    name: "Bronze Hall Residence",
    location: "Geneva",
    year: 2023,
    style: "Luxury Contemporary",
    scope: "Full renovation · 280 m²",
    rooms: ["Entry", "Living", "Bedroom"],
    summary:
      "A lakeside residence entered through a full-height bronze pivot door into a hall of grey stone and warm light.",
    story: [
      "First impressions are architectural here. The entry is a double-height volume in large-format grey stone, with a single backlit niche and a bronze pivot door heavy enough that it needs two hands.",
      "From there the house warms up progressively — stone gives way to oak, cool grey to honey, hard light to lamps — so by the time you reach the bedrooms it feels nothing like the hall.",
      "The living room holds the tension: a stone media wall, a warm sectional, and a suspended fireplace between them.",
    ],
    cover: "entryBronzePortal",
    gallery: ["entryBronzePortal", "livingPenthouseWarm", "bedroomWarmOak", "bathroomWoodVanity"],
    facts: [
      { label: "Duration", value: "16 months" },
      { label: "Entry", value: "Full-height bronze pivot" },
      { label: "Progression", value: "Stone → oak, cool → warm" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
