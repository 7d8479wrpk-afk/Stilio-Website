/**
 * Configuration for the procedural 3D interior. Everything the scene can change
 * — style, time of day, materials — is data here so the renderer stays dumb and
 * the controls stay in sync.
 */

export type StyleId = "warm" | "japandi" | "minimal" | "organic" | "contemporary" | "luxury";
export type TimeId = "day" | "sunset" | "evening" | "night";
export type QualityId = "high" | "medium" | "low";
export type MaterialTarget = "sofa" | "floor" | "table" | "wall";
export type PieceId = "sofa" | "loungeChair" | "coffeeTable" | "rug" | "floorLamp" | "artwork" | "planter" | "console";

export interface StylePreset {
  id: StyleId;
  label: string;
  blurb: string;
  colors: {
    wall: string;
    wallAccent: string;
    floor: string;
    ceiling: string;
    sofa: string;
    chair: string;
    wood: string;
    metal: string;
    stone: string;
    rug: string;
    cushion: string;
    plantPot: string;
  };
  /** 0 = crisp rectilinear, 1 = fully rounded. */
  softness: number;
  showPlant: boolean;
  showLoungeChair: boolean;
  tableMaterial: "wood" | "stone" | "travertine";
  artwork: "abstract-dark" | "gilt-branch" | "triptych-stone" | "none";
}

export const STYLE_ORDER: StyleId[] = ["warm", "japandi", "minimal", "organic", "contemporary", "luxury"];

export const STYLE_PRESETS: Record<StyleId, StylePreset> = {
  warm: {
    id: "warm",
    label: "Warm Contemporary",
    blurb: "Clean lines, warm woods, low-contrast neutrals.",
    colors: {
      wall: "#efe7d9",
      wallAccent: "#dbcfba",
      floor: "#9f8560",
      ceiling: "#ede8dc",
      sofa: "#b3a48d",
      chair: "#987856",
      wood: "#8a6a4a",
      metal: "#a9854b",
      stone: "#ded2bd",
      rug: "#cabca4",
      cushion: "#7c5238",
      plantPot: "#4a4038",
    },
    softness: 0.4,
    showPlant: true,
    showLoungeChair: true,
    tableMaterial: "travertine",
    artwork: "abstract-dark",
  },
  japandi: {
    id: "japandi",
    label: "Japandi",
    blurb: "Low, quiet, pale timber and paper light.",
    colors: {
      wall: "#e9e3d5",
      wallAccent: "#dcd3c0",
      floor: "#cdb389",
      ceiling: "#f0ebde",
      sofa: "#d5cbb6",
      chair: "#c9bfa6",
      wood: "#caa877",
      metal: "#8b8271",
      stone: "#ddd4c3",
      rug: "#cfc4ac",
      cushion: "#6f6553",
      plantPot: "#5f5546",
    },
    softness: 0.35,
    showPlant: true,
    showLoungeChair: false,
    tableMaterial: "wood",
    artwork: "none",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    blurb: "Fewer pieces, one gesture, pale everything.",
    colors: {
      wall: "#f1ece1",
      wallAccent: "#e7e0d2",
      floor: "#c7a575",
      ceiling: "#f5f1e7",
      sofa: "#d9d0bf",
      chair: "#d9d0bf",
      wood: "#b98f5f",
      metal: "#2e2c2a",
      stone: "#e6ddca",
      rug: "#e0d7c4",
      cushion: "#3a3a38",
      plantPot: "#8c8272",
    },
    softness: 0.15,
    showPlant: false,
    showLoungeChair: false,
    tableMaterial: "stone",
    artwork: "abstract-dark",
  },
  organic: {
    id: "organic",
    label: "Organic Modern",
    blurb: "Curves, bouclé, travertine, soft edges.",
    colors: {
      wall: "#ece4d4",
      wallAccent: "#ddd1bb",
      floor: "#c19a68",
      ceiling: "#f2ecdf",
      sofa: "#dad0be",
      chair: "#e2dac6",
      wood: "#a9825a",
      metal: "#b0894c",
      stone: "#e4d8c3",
      rug: "#d5c9b0",
      cushion: "#b06a4f",
      plantPot: "#6f5f49",
    },
    softness: 0.85,
    showPlant: true,
    showLoungeChair: true,
    tableMaterial: "travertine",
    artwork: "gilt-branch",
  },
  contemporary: {
    id: "contemporary",
    label: "Contemporary",
    blurb: "Crisp, architectural, controlled contrast.",
    colors: {
      wall: "#eae4d7",
      wallAccent: "#2e2a23",
      floor: "#b58a5b",
      ceiling: "#f3eee2",
      sofa: "#bcb2a0",
      chair: "#3a352d",
      wood: "#8c6743",
      metal: "#2e2c2a",
      stone: "#d7cdbb",
      rug: "#cfc5b0",
      cushion: "#2e2a23",
      plantPot: "#42392e",
    },
    softness: 0.2,
    showPlant: true,
    showLoungeChair: true,
    tableMaterial: "stone",
    artwork: "triptych-stone",
  },
  luxury: {
    id: "luxury",
    label: "Luxury Contemporary",
    blurb: "Book-matched stone, bronze, deep seating.",
    colors: {
      wall: "#e7ded0",
      wallAccent: "#d8cfc6",
      floor: "#7a5a3f",
      ceiling: "#efe9dc",
      sofa: "#8c6f53",
      chair: "#5a4231",
      wood: "#5a4231",
      metal: "#b0894c",
      stone: "#d8cfc6",
      rug: "#c9bda4",
      cushion: "#b0894c",
      plantPot: "#4a3b2e",
    },
    softness: 0.6,
    showPlant: true,
    showLoungeChair: true,
    tableMaterial: "stone",
    artwork: "abstract-dark",
  },
};

export interface TimePreset {
  id: TimeId;
  label: string;
  /** Sun direction in spherical-ish terms. */
  sun: { position: [number, number, number]; color: string; intensity: number };
  ambient: { color: string; intensity: number };
  hemi: { sky: string; ground: string; intensity: number };
  /** Interior lamps. */
  lamp: number;
  /** Window/sky glow behind the glazing. */
  windowColor: string;
  windowIntensity: number;
  /** Renderer tone-mapping exposure. */
  exposure: number;
  fog: string;
}

export const TIME_ORDER: TimeId[] = ["day", "sunset", "evening", "night"];

export const TIME_PRESETS: Record<TimeId, TimePreset> = {
  day: {
    id: "day",
    label: "Day",
    sun: { position: [-7, 4.5, 3], color: "#ffeed2", intensity: 2.2 },
    ambient: { color: "#dbe0e6", intensity: 0.2 },
    hemi: { sky: "#e6eaef", ground: "#b09776", intensity: 0.3 },
    lamp: 0.0,
    windowColor: "#e9ebe7",
    windowIntensity: 0.82,
    exposure: 0.73,
    fog: "#d8d3c6",
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    sun: { position: [-9, 1.5, 2], color: "#ffa257", intensity: 2.7 },
    ambient: { color: "#e5c4a0", intensity: 0.16 },
    hemi: { sky: "#eabf95", ground: "#5e4228", intensity: 0.22 },
    lamp: 0.5,
    windowColor: "#f4b673",
    windowIntensity: 1.45,
    exposure: 0.72,
    fog: "#ddc4a4",
  },
  evening: {
    id: "evening",
    label: "Evening",
    sun: { position: [3, 1.0, -3], color: "#5a5f7c", intensity: 0.22 },
    ambient: { color: "#333a54", intensity: 0.12 },
    hemi: { sky: "#2f3550", ground: "#1e1710", intensity: 0.16 },
    lamp: 1.2,
    windowColor: "#33436a",
    windowIntensity: 0.6,
    exposure: 0.66,
    fog: "#1e1f28",
  },
  night: {
    id: "night",
    label: "Night",
    sun: { position: [-3, 3, -4], color: "#3f4d92", intensity: 0.08 },
    ambient: { color: "#20263e", intensity: 0.08 },
    hemi: { sky: "#1c223a", ground: "#0d0a14", intensity: 0.12 },
    lamp: 1.55,
    windowColor: "#182749",
    windowIntensity: 0.32,
    exposure: 0.58,
    fog: "#13131c",
  },
};

/* ---- Object inspector data ------------------------------------------------ */

export interface PieceInfo {
  id: PieceId;
  name: string;
  detail: string;
  dimension: string;
  collection: string;
  materialTarget?: MaterialTarget;
}

export const PIECES: Record<PieceId, PieceInfo> = {
  sofa: {
    id: "sofa",
    name: "Sofa",
    detail: "Three-seat, low arm, feather-wrapped cushions",
    dimension: "280 cm",
    collection: "Contemporary Collection",
    materialTarget: "sofa",
  },
  loungeChair: {
    id: "loungeChair",
    name: "Lounge Chair",
    detail: "Curved shell on a solid timber base",
    dimension: "78 cm",
    collection: "Organic Series",
  },
  coffeeTable: {
    id: "coffeeTable",
    name: "Coffee Table",
    detail: "Solid top on a recessed plinth",
    dimension: "120 × 60 cm",
    collection: "Plinth Series",
    materialTarget: "table",
  },
  rug: {
    id: "rug",
    name: "Area Rug",
    detail: "Hand-loomed wool flatweave",
    dimension: "240 × 330 cm",
    collection: "Floor Series",
  },
  floorLamp: {
    id: "floorLamp",
    name: "Floor Lamp",
    detail: "Brushed-brass stem, linen shade, dimmable",
    dimension: "165 cm",
    collection: "Lighting Series",
  },
  artwork: {
    id: "artwork",
    name: "Artwork",
    detail: "Framed canvas, museum glass",
    dimension: "140 × 110 cm",
    collection: "Curated",
  },
  planter: {
    id: "planter",
    name: "Planter",
    detail: "Turned timber vessel with a fiddle-leaf fig",
    dimension: "Ø 42 cm",
    collection: "Botanic",
  },
  console: {
    id: "console",
    name: "Media Console",
    detail: "Full-height oak carcass, push-to-open",
    dimension: "220 cm",
    collection: "Joinery",
    materialTarget: "wall",
  },
};

/* ---- Material options for the switcher ---------------------------------- */

export interface MaterialOption {
  id: string;
  label: string;
  sub: string;
  color: string;
  roughness: number;
  metalness: number;
}

export const MATERIAL_OPTIONS: Record<MaterialTarget, MaterialOption[]> = {
  sofa: [
    { id: "linen", label: "Warm Linen", sub: "Belgian linen · 480 g/m²", color: "#c7b7a1", roughness: 0.95, metalness: 0 },
    { id: "boucle", label: "Wool Bouclé", sub: "Undyed, looped pile", color: "#ddd3bf", roughness: 1.0, metalness: 0 },
    { id: "velvet", label: "Mohair Velvet", sub: "Dense dry pile", color: "#8c6f53", roughness: 0.55, metalness: 0 },
    { id: "leather", label: "Saddle Leather", sub: "Full-grain, veg-tanned", color: "#9a6a44", roughness: 0.45, metalness: 0 },
  ],
  floor: [
    { id: "rift-oak", label: "Rift White Oak", sub: "Hard-wax oil, matte", color: "#c19a68", roughness: 0.72, metalness: 0 },
    { id: "walnut", label: "Smoked Walnut", sub: "Fumed, low sheen", color: "#6f4f37", roughness: 0.6, metalness: 0 },
    { id: "limestone", label: "Grey Limestone", sub: "Honed French stone", color: "#b7b1a6", roughness: 0.8, metalness: 0 },
    { id: "travertine", label: "Travertine", sub: "Filled and honed", color: "#ddceb2", roughness: 0.7, metalness: 0 },
  ],
  table: [
    { id: "travertine", label: "Roman Travertine", sub: "Cross-cut, honed", color: "#e4d8c3", roughness: 0.6, metalness: 0 },
    { id: "walnut", label: "Smoked Walnut", sub: "Solid, oiled", color: "#5a4231", roughness: 0.5, metalness: 0 },
    { id: "calacatta", label: "Calacatta Viola", sub: "Book-matched marble", color: "#ddd4c9", roughness: 0.28, metalness: 0 },
    { id: "basalt", label: "Honed Basalt", sub: "Near-black volcanic", color: "#3b3a38", roughness: 0.55, metalness: 0 },
  ],
  wall: [
    { id: "almond", label: "Soft Almond", sub: "Mineral emulsion, matte", color: "#ede4d3", roughness: 1, metalness: 0 },
    { id: "espresso", label: "Espresso Limewash", sub: "Two coats, unsealed", color: "#2e2a23", roughness: 1, metalness: 0 },
    { id: "calacatta", label: "Calacatta Viola", sub: "Full-height slab", color: "#d8cfc6", roughness: 0.3, metalness: 0 },
    { id: "oak", label: "Oak Panelling", sub: "Rift-sawn battens", color: "#b58a5b", roughness: 0.65, metalness: 0 },
  ],
};

export const DEFAULT_MATERIALS: Record<MaterialTarget, string> = {
  sofa: "linen",
  floor: "rift-oak",
  table: "travertine",
  wall: "almond",
};
