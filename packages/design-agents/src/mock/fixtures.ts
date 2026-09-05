import type { AgentId } from "../domain.js";
import type { MockContext, MockFixture } from "../llm/mock-client.js";
import type {
  BriefCompilation,
  BudgetEstimate,
  DesignReview,
  DirectorIntake,
  DirectorPresentation,
  DirectorResolution,
  DirectorSynthesis,
  FurniturePlan,
  LayoutProposal,
  LightingPlan,
  MaterialPalette,
  StyleDirection,
  VisualizationSpec,
} from "../agents/schemas.js";

/**
 * Deterministic fixtures for the canonical example (brief section 13):
 * a 5 m x 4 m living room, warm modern, large north window, $10,000 budget.
 *
 * They are internally consistent so the whole workflow — including a real
 * budget overrun, a Director conflict resolution, and a Critic "revise" verdict —
 * runs end to end offline.
 */

const intake: DirectorIntake = {
  understoodBrief:
    "You want a warm, modern living room in a 5 m x 4 m space with a large north-facing window, on a $10,000 budget.",
  known: [
    { field: "Room type", value: "Living room", basis: "confirmed" },
    { field: "Dimensions", value: "5 m x 4 m", basis: "confirmed" },
    { field: "Window", value: "Large window on the north wall", basis: "confirmed" },
    { field: "Budget", value: "$10,000", basis: "confirmed" },
    { field: "Style", value: "Modern but warm, not cold", basis: "confirmed" },
  ],
  missingCritical: [
    {
      question: "How many people normally use the room?",
      why: "Drives seating capacity and circulation.",
      blocksAgents: ["space_planner", "furniture_curator"],
    },
    {
      question: "Do you need a TV, and wall-mounted or on a unit?",
      why: "Determines the focal wall and layout orientation.",
      blocksAgents: ["space_planner", "furniture_curator", "lighting_designer"],
    },
    {
      question: "Do you already own furniture that must stay?",
      why: "Existing pieces constrain layout, palette and budget.",
      blocksAgents: ["space_planner", "style_director", "furniture_curator", "budget_manager"],
    },
    {
      question: "Are there children or pets?",
      why: "Affects material durability and fabric choice.",
      blocksAgents: ["material_specialist", "furniture_curator"],
    },
    {
      question: "Sofa, sectional, or both?",
      why: "Changes the seating footprint significantly.",
      blocksAgents: ["space_planner", "furniture_curator"],
    },
  ],
  assumptionsIfUnanswered: [
    {
      statement: "Assume 2-4 regular users.",
      basis: "assumed",
      impactIfWrong: "Seating count and circulation widths change.",
    },
    {
      statement: "Assume a wall-mounted TV is wanted.",
      basis: "assumed",
      impactIfWrong: "The focal wall and the whole layout orientation flip.",
    },
  ],
  readyToProceed: false,
};

const brief: BriefCompilation = {
  title: "Warm modern living room",
  roomType: "living_room",
  dimensions: { lengthM: 5, widthM: 4, heightM: 2.7 },
  openings: [
    {
      type: "window",
      wall: "north",
      widthM: 2.4,
      heightM: 1.5,
      offsetFromCornerM: 0.8,
      notes: "Large existing window, sill ~0.9 m. Cool, even daylight.",
    },
    { type: "door", wall: "east", widthM: 0.9, swing: "in", notes: "Entry from hallway." },
  ],
  clientPreferences: {
    stylePreferences: ["Modern", "Warm modern", "Not cold or clinical"],
    colorPreferences: ["Warm neutrals", "Soft almond", "Honey oak"],
    materialPreferences: ["Natural wood", "Linen", "Wool"],
    dislikes: ["Cold grey", "High-gloss finishes", "Heavy industrial look"],
    functionalRequirements: [
      "Seat 4-5 people",
      "Wall-mounted TV",
      "A comfortable reading spot",
      "Clear circulation to the window",
    ],
    accessibilityNeeds: [],
    householdSize: 3,
    hasChildren: false,
    hasPets: false,
    inspirationNotes: ["Warm Scandinavian / Japandi references"],
  },
  existingFurnitureToKeep: [],
  budgetTotal: 10000,
  currency: "USD",
  architecturalNotes: [
    "North-facing window gives cool, even daylight — electric light must add warmth.",
    "Ceiling height assumed 2.7 m — confirm on site.",
  ],
  openQuestions: ["Confirm ceiling height.", "Confirm whether the floor can be replaced or only refinished."],
  assumptions: [
    {
      statement: "Ceiling height is 2.7 m.",
      basis: "assumed",
      impactIfWrong: "Pendant drop heights and any tall storage need rework.",
    },
    {
      statement: "The existing floor can be refinished or replaced.",
      basis: "assumed",
      impactIfWrong: "The flooring line of the material palette is void.",
    },
  ],
};

const layout: LayoutProposal = {
  room: "living_room",
  summary:
    "L-shaped seating on a wool rug faces the north window; the TV is wall-mounted on the west wall above a low console. Entry from the east door lands on a 95 cm circulation path around the seating group.",
  chosenConcept: "L-shaped seating facing the north window, TV on the west wall",
  furniturePlacements: [
    {
      item: "3-seat sofa",
      approxSizeCm: { widthCm: 220, depthCm: 95, heightCm: 82 },
      position: "Against the south wall, centred, 20 cm off the wall",
      facing: "North, toward the window",
      rationale: "Longest uninterrupted wall; keeps the window view open from the main seat.",
    },
    {
      item: "Lounge chair (pair)",
      approxSizeCm: { widthCm: 75, depthCm: 80, heightCm: 78 },
      position: "West end of the seating group, angled toward the sofa",
      facing: "Toward the sofa / coffee table",
      rationale: "Completes the L; the west chair doubles as the reading spot near the lamp.",
    },
    {
      item: "Coffee table",
      approxSizeCm: { widthCm: 120, depthCm: 60, heightCm: 38 },
      position: "Centred on the seating group, 40 cm from the sofa",
      rationale: "Reachable from all seats without blocking the walkway to the window.",
    },
    {
      item: "TV console",
      approxSizeCm: { widthCm: 160, depthCm: 40, heightCm: 45 },
      position: "Against the west wall, centred; TV wall-mounted above",
      rationale: "Short wall opposite the reading chair; keeps cabling off the window wall.",
    },
    {
      item: "Rug",
      approxSizeCm: { widthCm: 240, depthCm: 330 },
      position: "Under the seating group, front feet of all seats on the rug",
      rationale: "Anchors the L and defines circulation around it.",
    },
  ],
  circulation: [
    { path: "East door to seating group", minWidthCm: 95, notes: "Primary route; stays clear of the door swing." },
    { path: "Seating group to north window", minWidthCm: 80, notes: "Secondary route for reaching the window/drapery." },
    { path: "Behind the sofa", minWidthCm: 20, notes: "Sofa sits 20 cm off the wall; not a walkway." },
  ],
  clearances: [
    { between: "Sofa front to coffee table", recommendedCm: 40, notes: "Comfortable reach, easy to pass." },
    { between: "Coffee table to TV console", recommendedCm: 100, notes: "Keeps the window walkway open." },
    { between: "Lounge chairs to east wall", recommendedCm: 85, notes: "Tight but acceptable for a secondary path." },
  ],
  spatialProblems: [
    {
      issue: "A 3-seat sofa plus two lounge chairs leaves ~85 cm on the east side — fine now, tight if a sectional is chosen later.",
      severity: "low",
      priorityCategory: "functionality",
      suggestedFix: "If seating grows, drop to one lounge chair or shift the sofa 15 cm west.",
    },
  ],
  reasoning:
    "The south wall is the only run long enough for a 3-seat sofa. Facing north keeps the window as the outlook and puts the cool daylight behind the seated viewer rather than in their eyes. The TV on the west wall is off-axis from the window so there is no daytime glare on the screen. The L-shape seats five (sofa + two chairs) inside a 240x330 rug without crossing the two circulation paths.",
  alternativeLayouts: [
    {
      name: "Conversation-focused",
      focus: "conversation-focused",
      description: "Two 2-seat sofas facing each other across the coffee table, parallel to the window; TV demoted to a corner swing-arm.",
      tradeoffs: "Best for talking and the view; poor primary TV viewing angle.",
    },
    {
      name: "TV-focused",
      focus: "TV-focused",
      description: "Sofa plus a compact chaise facing the west TV wall; window becomes a side outlook.",
      tradeoffs: "Best film watching; the window view is no longer the room's focus and glare control matters more.",
    },
    {
      name: "Open-plan friendly",
      focus: "open-plan",
      description: "Sofa floats 90 cm off the south wall with a slim console behind it, defining a walkway to an adjacent space.",
      tradeoffs: "Great if the room opens to a kitchen/hall; loses ~40 cm of usable seating depth.",
    },
  ],
  fitsWithinRoom: true,
  conflicts: [],
  assumptions: [
    {
      statement: "Ceiling height is 2.7 m.",
      basis: "assumed",
      impactIfWrong: "Pendant mounting height over the coffee table changes.",
    },
    {
      statement: "The east door swings into the room.",
      basis: "assumed",
      impactIfWrong: "If it swings out, ~0.8 m² near the door is freed and the sofa can shift east.",
    },
  ],
};

const style: StyleDirection = {
  primaryStyle: "Warm Contemporary",
  secondaryStyle: "Organic Modern",
  visualDirection:
    "Modern lines softened with warm woods, natural textiles and a low-contrast warm-neutral palette, so the room reads calm and inviting rather than clinical. The cool north light is answered with warm materials and warm electric light.",
  palette: [
    { name: "Soft almond (warm white)", role: "dominant", hex: "#EFE7DA", notes: "Walls, ceiling, large soft surfaces." },
    { name: "Greige", role: "neutral", hex: "#C9BEB0", notes: "Upholstery, drapery, rug ground." },
    { name: "Honey oak", role: "secondary", hex: "#B8895A", notes: "Floor and timber furniture; always a warm tone." },
    { name: "Charcoal", role: "accent", hex: "#3A3A38", notes: "One grounding accent per plane — cushions, lamp base, TV." },
    { name: "Muted terracotta", role: "accent", hex: "#B06A4F", notes: "Small warm pops — throw, ceramic, art." },
  ],
  materials: ["White oak", "Linen", "Boucle wool", "Travertine", "Brushed brass"],
  textures: ["Matte plaster", "Nubby wool", "Raw-edge timber", "Honed stone"],
  shapes: ["Low horizontal profiles", "Softened rectangles", "Rounded arms", "Organic curves in accents"],
  visualBalance:
    "Roughly 70% warm neutrals, 20% mid oak tone, 10% charcoal and terracotta accents. Visual weight sits low and grounded; nothing glossy pulls the eye.",
  styleCombinations: [
    { name: "Warm Contemporary base", description: "Clean-lined seating, flush cabinetry, matte walls." },
    { name: "Organic Modern accents", description: "A curved chair, a raw-edge shelf, a sculptural pendant." },
  ],
  avoid: [
    "High-gloss or lacquered finishes",
    "Cool grey tones",
    "Large areas of pure black",
    "Chrome and polished nickel",
    "Heavy industrial elements (exposed conduit, raw steel)",
  ],
  rulesForOtherAgents: [
    "Wood tones must be warm (white oak / walnut), never grey-washed or ashy.",
    "No glossy, lacquered or high-sheen surfaces anywhere.",
    "At most one charcoal element per surface plane.",
    "Metals are brushed brass or bronze — never chrome.",
    "Upholstery is natural fibre or a matte performance fabric.",
    "Colour temperature of electric light stays 2700-3000 K.",
  ],
  conflicts: [],
  assumptions: [
    {
      statement: "The north light reads cool, so the palette leans warm to compensate.",
      basis: "inferred",
      impactIfWrong: "If the room gets warm afternoon light, the terracotta accents may feel heavy and should be reduced.",
    },
  ],
};

const furniture: FurniturePlan = {
  items: [
    {
      item: "3-seat sofa",
      category: "seating",
      functionalPriority: "essential",
      recommendedSizeCm: { widthMinCm: 200, widthMaxCm: 235, depthCm: 95, heightCm: 82 },
      material: "Linen / matte performance fabric",
      color: "Warm greige",
      style: "Warm contemporary, low arms",
      quantity: 1,
      budget: { currency: "USD", min: 1800, max: 3200 },
      reason: "Primary seating for the south wall; must stay under 235 cm to hold the layout clearances.",
      respectsLayout: true,
      alternative: {
        item: "Two-seat sofa (150 cm) + one accent chair",
        whyDifferent: "About $1,100 cheaper and more flexible; keeps the L-shape with a smaller footprint.",
        budget: { currency: "USD", min: 1200, max: 2000 },
      },
    },
    {
      item: "Lounge chair",
      category: "seating",
      functionalPriority: "recommended",
      recommendedSizeCm: { widthMinCm: 70, widthMaxCm: 80, depthCm: 80 },
      material: "Boucle wool",
      color: "Cream",
      style: "Organic modern, rounded",
      quantity: 2,
      budget: { currency: "USD", min: 900, max: 1800 },
      reason: "Completes the L and provides the reading seat; curved form delivers the Organic Modern accent.",
      respectsLayout: true,
      alternative: {
        item: "One lounge chair + a floor cushion set",
        whyDifferent: "Frees the east walkway and saves ~$500.",
        budget: { currency: "USD", min: 450, max: 900 },
      },
    },
    {
      item: "Coffee table",
      category: "tables",
      functionalPriority: "recommended",
      recommendedSizeCm: { widthMinCm: 95, widthMaxCm: 120, depthCm: 60, heightCm: 38 },
      material: "White oak with a honed travertine top",
      color: "Natural oak / warm stone",
      style: "Warm contemporary",
      quantity: 1,
      budget: { currency: "USD", min: 400, max: 800 },
      reason: "Reachable from every seat; 95-120 cm depending on whether the smaller sofa is chosen.",
      respectsLayout: true,
      alternative: {
        item: "Nesting pair of round oak tables",
        whyDifferent: "Adapts to either seating option; similar cost.",
        budget: { currency: "USD", min: 350, max: 700 },
      },
    },
    {
      item: "TV console",
      category: "storage",
      functionalPriority: "essential",
      recommendedSizeCm: { widthMinCm: 150, widthMaxCm: 180, depthCm: 40, heightCm: 45 },
      material: "White oak, flush fronts",
      color: "Honey oak",
      style: "Warm contemporary, low",
      quantity: 1,
      budget: { currency: "USD", min: 500, max: 1100 },
      reason: "Conceals media and cabling under the wall-mounted TV; low profile keeps the west wall calm.",
      respectsLayout: true,
      alternative: {
        item: "Wall-mounted oak shelf + closed side cabinet",
        whyDifferent: "Lighter visually, ~$200 less, but less enclosed storage.",
        budget: { currency: "USD", min: 300, max: 700 },
      },
    },
    {
      item: "Area rug",
      category: "rug",
      functionalPriority: "recommended",
      recommendedSizeCm: { widthMinCm: 240, widthMaxCm: 300, depthCm: 330 },
      material: "Wool-blend flatweave",
      color: "Oatmeal",
      style: "Warm contemporary",
      quantity: 1,
      budget: { currency: "USD", min: 400, max: 900 },
      reason: "Defines the seating zone; 240x330 keeps all front feet on the rug.",
      respectsLayout: true,
      alternative: {
        item: "Machine-washable wool-look rug",
        whyDifferent: "Half the price, easier upkeep, slightly less premium hand.",
        budget: { currency: "USD", min: 180, max: 400 },
      },
    },
    {
      item: "Arc floor lamp",
      category: "lighting",
      functionalPriority: "optional",
      recommendedSizeCm: { widthMinCm: 25, widthMaxCm: 35, heightCm: 200 },
      material: "Brushed brass",
      color: "Warm brass",
      style: "Organic modern",
      quantity: 1,
      budget: { currency: "USD", min: 150, max: 350 },
      reason: "Task light over the reading chair; brass ties into the metal rule.",
      respectsLayout: true,
      alternative: null,
    },
  ],
  totalEstimate: { currency: "USD", min: 4150, max: 8250 },
  conflicts: [
    {
      withAgent: "budget_manager",
      topic: "Full furniture set vs budget share",
      description: "At mid-range prices the furniture set alone consumes ~$6,200 of a $10,000 whole-room budget.",
      thisAgentPosition: "The essential pieces (sofa, console) should be protected; the lounge chairs and rug can take the lower alternative.",
      priorityCategory: "budget",
      proposedResolution: "Adopt the two-seat sofa + accent chair alternative and the washable rug if the total needs to drop.",
    },
  ],
  assumptions: [
    {
      statement: "No existing seating is being reused.",
      basis: "assumed",
      impactIfWrong: "If a sofa is kept, the seating budget largely disappears and the palette must match it.",
    },
  ],
};

const materials: MaterialPalette = {
  surfaces: [
    {
      surface: "flooring",
      material: "Engineered white oak (or sand & refinish existing timber)",
      finish: "Matte hard-wax oil",
      color: "Warm honey",
      durability: "high",
      maintenance: "Dust-mop; damp-mop monthly; re-oil traffic lanes every 2-3 years.",
      estCost: { currency: "USD", min: 1200, max: 3800 },
      compatibilityNotes:
        "Warm honey tone is the anchor of the palette. Refinishing an existing floor to this tone saves ~$2,400 with no visual compromise.",
    },
    {
      surface: "walls",
      material: "Acrylic latex paint",
      finish: "Matte",
      color: "Soft almond (warm white)",
      durability: "medium",
      maintenance: "Spot-clean with a damp cloth; touch-up every few years.",
      estCost: { currency: "USD", min: 350, max: 650 },
      compatibilityNotes: "Matte only, per the style rules; warm white counteracts the cool north light.",
    },
    {
      surface: "ceiling",
      material: "Flat ceiling paint",
      finish: "Matte",
      color: "Warm white, one shade lighter than the walls",
      durability: "medium",
      maintenance: "Minimal.",
      estCost: { currency: "USD", min: 120, max: 250 },
      compatibilityNotes: "Keeps the 2.7 m ceiling feeling open without going cold.",
    },
    {
      surface: "trim",
      material: "Acrylic trim paint",
      finish: "Satin (lowest sheen that wears well on trim)",
      color: "Same warm white as the walls",
      durability: "high",
      maintenance: "Wipe clean.",
      estCost: { currency: "USD", min: 150, max: 350 },
      compatibilityNotes: "Tone-on-tone trim keeps the shell quiet so wood and textiles lead.",
    },
    {
      surface: "window_treatment",
      material: "Linen-blend drapery, ceiling-mounted track",
      finish: "Natural, unlined or light-filtering lined",
      color: "Oatmeal",
      durability: "medium",
      maintenance: "Machine wash cold, hang dry.",
      estCost: { currency: "USD", min: 300, max: 700 },
      compatibilityNotes: "Softens winter contrast at the north window and adds warmth and texture.",
    },
    {
      surface: "rug",
      material: "Wool-blend flatweave",
      finish: "Low pile",
      color: "Oatmeal",
      durability: "medium",
      maintenance: "Vacuum weekly; professional clean yearly.",
      estCost: { currency: "USD", min: 400, max: 900 },
      compatibilityNotes: "Matches the furniture rug spec; natural fibre per the style rules.",
    },
    {
      surface: "hardware",
      material: "Brushed brass",
      finish: "Brushed",
      color: "Warm brass",
      durability: "high",
      maintenance: "Wipe; patina is acceptable.",
      estCost: { currency: "USD", min: 80, max: 200 },
      compatibilityNotes: "Brass, never chrome, per the style rules.",
    },
  ],
  paletteSummary:
    "Warm honey oak underfoot, soft-almond matte walls, oatmeal linen and wool textiles, brushed-brass accents — every surface matte.",
  respectsExistingArchitecture: true,
  conflicts: [],
  assumptions: [
    {
      statement: "The existing subfloor is level and dry enough for engineered timber.",
      basis: "assumed",
      impactIfWrong: "Floor levelling adds $400-900, or a floating system is needed.",
    },
  ],
};

const lighting: LightingPlan = {
  ambient:
    "Four adjustable LED downlights on a dimmer over the seating group (3000 K) plus a central linen-drum pendant for a soft general wash.",
  task: "Arc floor lamp beside the reading chair (2700-3000 K); ceramic table lamp on the TV console for evening use.",
  accent:
    "Two plaster wall-wash sconces grazing the wall behind the sofa; small picture light on art above the console. (Accent layer can be phased to a later stage if the budget is tight.)",
  decorative: "The linen-drum pendant over the coffee table is the room's jewel; the brass table lamp reads as an object.",
  naturalLight:
    "The large north window gives flat, even daylight all day with little glare; drapery softens winter contrast. Electric light must add the warmth the north light lacks.",
  fixtures: [
    {
      name: "Adjustable LED downlight",
      layer: "ambient",
      placement: "Ceiling grid over the seating group",
      quantity: 4,
      colorTempK: { min: 2700, max: 3000 },
      dimmable: true,
      estCost: { currency: "USD", min: 240, max: 520 },
    },
    {
      name: "Linen-drum pendant",
      layer: "decorative",
      placement: "Centred over the coffee table, ~168 cm above finished floor",
      quantity: 1,
      colorTempK: { min: 2700, max: 2700 },
      dimmable: true,
      estCost: { currency: "USD", min: 180, max: 420 },
    },
    {
      name: "Arc floor lamp",
      layer: "task",
      placement: "Behind / beside the reading chair",
      quantity: 1,
      colorTempK: { min: 2700, max: 3000 },
      dimmable: true,
      estCost: { currency: "USD", min: 150, max: 350 },
    },
    {
      name: "Ceramic table lamp",
      layer: "decorative",
      placement: "On the TV console",
      quantity: 1,
      colorTempK: { min: 2700, max: 2700 },
      dimmable: false,
      estCost: { currency: "USD", min: 90, max: 220 },
    },
    {
      name: "Plaster wall-wash sconce",
      layer: "accent",
      placement: "Flanking the sofa wall",
      quantity: 2,
      colorTempK: { min: 2700, max: 2700 },
      dimmable: true,
      estCost: { currency: "USD", min: 200, max: 460 },
    },
  ],
  colorTemperature: {
    min: 2700,
    max: 3000,
    notes: "Warm throughout: 2700 K for lamps and sconces, 3000 K for the downlights so task areas stay crisp.",
  },
  scenes: [
    { name: "day", description: "Electric light off or downlights at 10%; daylight does the work, drapery open.", activeLayers: ["ambient"] },
    { name: "evening", description: "Downlights 40%, pendant 60%, table lamp on — even, warm, sociable.", activeLayers: ["ambient", "decorative"] },
    { name: "night", description: "Downlights off, pendant 20%, one lamp on low — minimal wayfinding glow.", activeLayers: ["decorative"] },
    {
      name: "entertaining",
      description: "Pendant 70%, sconces on, downlights 30%, lamps on — layered and lively, no single bright source.",
      activeLayers: ["ambient", "accent", "decorative"],
    },
    {
      name: "relaxing",
      description: "Downlights off, sconces 30%, floor lamp on for reading, pendant 15% — pools of warm light.",
      activeLayers: ["accent", "task", "decorative"],
    },
  ],
  conflicts: [],
  assumptions: [
    {
      statement: "There is existing ceiling wiring for downlights and a central pendant point.",
      basis: "assumed",
      impactIfWrong: "Adding circuits/relocating points adds $300-800 of electrician time.",
    },
  ],
};

const budget: BudgetEstimate = {
  currency: "USD",
  lineItems: [
    { category: "furniture", label: "Sofa, lounge chairs, coffee table, TV console, rug, floor lamp", amount: 6200, basis: "inferred" },
    { category: "materials", label: "New engineered oak flooring + install allowance", amount: 3000, basis: "inferred" },
    { category: "materials", label: "Paint (walls, ceiling, trim)", amount: 900, basis: "inferred" },
    { category: "materials", label: "Drapery + track + brass hardware", amount: 700, basis: "inferred" },
    { category: "lighting", label: "Downlights, pendant, sconces, lamps", amount: 1400, basis: "inferred" },
    { category: "decor", label: "Art, cushions, ceramics, styling objects", amount: 800, basis: "assumed" },
    { category: "installation", label: "Electrician, flooring fitter, TV mount, hanging", amount: 1600, basis: "assumed" },
  ],
  categoryTotals: [
    { category: "furniture", amount: 6200 },
    { category: "materials", amount: 4600 },
    { category: "lighting", amount: 1400 },
    { category: "decor", amount: 800 },
    { category: "installation", amount: 1600 },
  ],
  estimatedTotal: 14600,
  userBudget: 10000,
  remaining: -4600,
  overBudget: true,
  overrunAnalysis:
    "The scheme is 46% over budget, driven by new flooring and the full mid-range furniture set. The concept survives at budget without touching layout, palette or style by: (1) sand-and-refinish the existing floor instead of new engineered oak (-$2,400); (2) take the two-seat sofa + accent chair seating option (-$1,100); (3) phase the two accent wall-wash sconces to a later stage (-$700). That lands near $10,400 — a ~$400 overage to confirm with the client, or closed entirely by styling with owned objects and buying art over time.",
  savingOpportunities: [
    { area: "Flooring", action: "Sand & refinish existing timber to the honey tone instead of new engineered oak", estSaving: 2400, conceptImpact: "low" },
    { area: "Seating", action: "Use the Furniture Curator's two-seat sofa + accent chair alternative", estSaving: 1100, conceptImpact: "low" },
    { area: "Lighting", action: "Phase the plaster wall-wash sconces to stage 2", estSaving: 700, conceptImpact: "low" },
    { area: "Decor", action: "Style with owned objects; acquire art gradually", estSaving: 500, conceptImpact: "none" },
  ],
  tiers: [
    { name: "essential", total: 9600, description: "Layout, sofa+chair seating, floor refinish, downlights + pendant + lamps, paint, rug." },
    { name: "balanced", total: 11800, description: "Adds either the new oak floor or the full accent-lighting + drapery package." },
    { name: "elevated", total: 14600, description: "Everything exactly as specified: new oak floor, full furniture set, full four-layer lighting." },
  ],
  assumptions: [
    {
      statement: "Labour is priced at metro rates; flooring install ~$35/m².",
      basis: "assumed",
      impactIfWrong: "Rural or premium installers shift the total by roughly ±$800.",
    },
  ],
};

const review: DesignReview = {
  scores: { functionality: 9, styleConsistency: 9, budget: 5, spatialEfficiency: 8, lighting: 8 },
  overall: 8,
  issues: [
    {
      id: "I1",
      description: "Estimated total $14,600 exceeds the $10,000 budget by 46%.",
      category: "budget",
      severity: "major",
      affects: ["budget_manager", "furniture_curator", "material_specialist"],
      recommendedRevision:
        "Apply the Budget Manager's concept-preserving cuts (refinish floor, two-seat sofa + chair, phase sconces), re-cost to <= $10,500, and confirm any small overage with the client.",
    },
    {
      id: "I2",
      description:
        "Coffee table at 120 cm suits the 220 cm sofa, but would be oversized against the ~150 cm two-seat alternative.",
      category: "functionality",
      severity: "minor",
      affects: ["furniture_curator", "space_planner"],
      recommendedRevision: "If the seating downgrade is taken, drop the coffee table to 90-100 cm or use the nesting pair.",
    },
    {
      id: "I3",
      description: "A pendant at 150 cm AFF over the coffee table can obstruct sightlines across the seating group in a 2.7 m ceiling.",
      category: "functionality",
      severity: "minor",
      affects: ["lighting_designer"],
      recommendedRevision: "Raise the pendant to 165-170 cm AFF or specify a narrow/uplight profile.",
    },
  ],
  missingInformation: [
    "Whether the client will replace the flooring or refinish what exists.",
    "Confirmed ceiling height.",
  ],
  styleConflicts: [],
  verdict: "revise",
  summary:
    "A strong, coherent warm-contemporary scheme that is functionally sound and well lit. The one real problem is cost — it is 46% over budget. The Budget Manager has already identified concept-preserving reductions; apply them and the design ships. Two minor furniture/lighting dimension tweaks to confirm.",
};

const synthesis: DirectorSynthesis = {
  narrative:
    "A calm warm-contemporary living room. An L-shaped seating group on an oatmeal wool rug faces the north window; the TV is wall-mounted on the west wall above a low white-oak console. Layered warm light (2700-3000 K) compensates for the cool north daylight. The palette is soft almond, honey oak and oatmeal with charcoal and muted-terracotta accents.",
  chosenLayoutConcept: "L-shaped seating facing the north window, TV on the west wall",
  chosenStyleDirection: "Warm Contemporary with Organic Modern accents",
  detectedConflicts: [
    {
      id: "C1",
      between: ["budget_manager", "furniture_curator", "material_specialist"],
      topic: "Scope vs budget",
      description: "Full furniture set + new engineered oak floor + full four-layer lighting totals $14,600 against a $10,000 budget.",
      priorityCategory: "budget",
      resolution:
        "Hold layout, palette and style fixed. Take three concept-preserving reductions: refinish the existing floor, use the two-seat sofa + accent chair, phase the accent sconces. Re-cost to ~$10,400 and confirm the ~$400 overage with the client.",
      resolvedInFavorOf: "compromise",
      actionsRequired: [
        { agent: "material_specialist", change: "Specify sand-and-refinish of the existing timber to the honey tone instead of new engineered oak." },
        { agent: "furniture_curator", change: "Switch primary seating to the two-seat sofa + accent chair; coffee table to 90-100 cm." },
        { agent: "lighting_designer", change: "Move the two plaster wall-wash sconces to a phase-2 list; keep pendant, downlights and lamps." },
        { agent: "budget_manager", change: "Re-estimate with the above and produce a tier at or below $10,500." },
      ],
    },
  ],
  revisionRequests: [
    {
      agent: "material_specialist",
      instruction: "Revise the flooring line to sand-and-refinish the existing timber to the honey tone rather than new engineered oak.",
      reason: "Budget: ~$2,400 saving with low concept impact.",
    },
    {
      agent: "furniture_curator",
      instruction: "Switch primary seating to the two-seat sofa + accent chair option and reduce the coffee table to 90-100 cm.",
      reason: "Budget: ~$1,100 saving; keeps the L-shape.",
    },
    {
      agent: "lighting_designer",
      instruction: "Move the two accent wall-wash sconces to a phase-2 list; keep the rest of the plan.",
      reason: "Budget: $700 saving; the accent layer can be added later.",
    },
  ],
  openDecisionsForUser: [
    "Confirm you are comfortable refinishing the existing floor rather than replacing it.",
    "Confirm a final budget ceiling — the trimmed scheme lands around $10,400.",
  ],
  readyForCritic: true,
};

const resolution: DirectorResolution = {
  addressedIssues: [
    {
      issueId: "I1",
      resolution:
        "Concept-preserving reductions applied: floor refinish, two-seat sofa + accent chair, accent sconces phased. Revised estimate ~$10,400; client to confirm the ~$400 overage or close it by phasing art.",
      agentsToRerun: [],
    },
    { issueId: "I2", resolution: "Coffee table reduced to 95 cm to match the two-seat sofa run.", agentsToRerun: [] },
    { issueId: "I3", resolution: "Pendant raised to 168 cm AFF; narrow-profile shade specified.", agentsToRerun: [] },
  ],
  unresolvedIssues: [
    {
      issueId: "budget-ceiling",
      why: "The final budget ceiling and the floor-refinish approach need the client's sign-off, but do not block design work.",
      needsUser: false,
    },
  ],
  finalNarrative:
    "Warm-contemporary living room: L-shaped seating to the north window, wall-mounted TV on a low oak console, layered 2700-3000 K lighting. The scheme was trimmed to ~$10,400 by refinishing the existing floor, using a two-seat sofa with an accent chair, and phasing the accent sconces. Layout, palette and style are unchanged from the approved direction.",
  readyToFinalize: true,
};

const presentation: DirectorPresentation = {
  headline: "Your warm, modern living room",
  summary:
    "We've designed a calm, warm-contemporary living room that seats five, keeps your north window as the view, and puts the TV on the west wall with no daytime glare. Warm woods, soft-almond walls, oatmeal textiles and brushed brass keep it modern without feeling cold. Layered lighting at 2700-3000 K adds the warmth the north light doesn't give you.",
  highlights: [
    "L-shaped seating on a 240x330 wool rug, facing the window.",
    "Wall-mounted TV over a low white-oak console on the west wall.",
    "Soft-almond matte walls, honey-oak floor, oatmeal linen drapery, brushed-brass accents.",
    "Four lighting layers with five presets: day, evening, night, entertaining, relaxing.",
  ],
  tradeoffsMade: [
    "To hit the budget we refinish your existing floor instead of laying new oak (same look, ~$2,400 less).",
    "Primary seating is a two-seat sofa plus an accent chair rather than a full 3-seater (~$1,100 less, same L-shape).",
    "The two accent wall sconces are phased to a later stage.",
  ],
  openWithUser: [
    "Confirm the existing floor can be sanded and refinished.",
    "Confirm a final budget ceiling — the trimmed scheme is about $10,400.",
    "Confirm ceiling height on site (assumed 2.7 m).",
  ],
  nextSteps: [
    "Approve the direction and we generate the 3D visualization.",
    "We produce a shopping list with specific products in your price bands.",
    "Book the floor refinish and electrician.",
  ],
};

function visualization(): VisualizationSpec {
  return {
    sceneSummary:
      "A 5 x 4 m warm-contemporary living room, late-afternoon warm electric light. L-shaped seating on an oatmeal rug faces a large north window with oatmeal linen drapery; a wall-mounted TV sits above a low honey-oak console on the west wall. Soft-almond matte walls, honey-oak floor, brushed-brass accents.",
    cameraAngles: [
      { name: "Hero — from the east door", description: "Eye-level three-quarter view taking in the sofa, rug and window beyond.", lensMm: 24, heightCm: 155 },
      { name: "Seating detail", description: "Lower angle across the coffee table toward the reading chair and floor lamp.", lensMm: 35, heightCm: 110 },
      { name: "TV wall", description: "Straight-on view of the west wall: mounted TV, console, table lamp.", lensMm: 35, heightCm: 140 },
    ],
    lightingConditions: [
      { scene: "evening", description: "Downlights 40%, pendant 60%, table lamp on; warm 2700-3000 K, soft shadows." },
      { scene: "day", description: "Cool even north daylight, drapery open, electric light off." },
    ],
    materialCallouts: [
      { surface: "floor", material: "White oak, refinished", finish: "Matte hard-wax oil, warm honey" },
      { surface: "walls", material: "Acrylic latex paint", finish: "Matte, soft almond" },
      { surface: "sofa", material: "Linen / performance fabric", finish: "Matte, warm greige" },
      { surface: "coffee table", material: "White oak + honed travertine", finish: "Matte" },
      { surface: "accents", material: "Brushed brass", finish: "Brushed" },
    ],
    keyProps: ["Oatmeal wool rug 240x330", "Linen-drum pendant", "Arc brass floor lamp", "Muted-terracotta throw", "Two ceramic vases", "Framed abstract art over the console"],
    beforeAfter: {
      before: "Empty 5 x 4 m room, bare existing timber floor, white walls, uncovered north window, single ceiling point.",
      after:
        "Furnished warm-contemporary living room: L-shaped seating on an oatmeal rug facing the window, wall-mounted TV over a low oak console, soft-almond walls, linen drapery, layered warm lighting.",
    },
    renderPrompts: [
      {
        view: "Hero",
        prompt:
          "Interior render, 5x4m living room, warm contemporary with organic modern accents. Two-seat greige linen sofa against the far wall plus a cream boucle accent chair forming an L on a 240x330 oatmeal wool rug. 95cm white-oak-and-travertine coffee table. Wall-mounted TV on the west wall above a low honey-oak console. Large north window with floor-to-ceiling oatmeal linen drapery. Soft-almond matte walls, refinished honey-oak floor, brushed-brass details. Evening light: warm 2700-3000K, linen-drum pendant glowing at 168cm, arc floor lamp by the chair, gentle contrast, no glossy surfaces. 24mm, camera at 155cm by the east doorway.",
        negativePrompt: "cool grey tones, high-gloss surfaces, chrome, harsh shadows, industrial elements, clutter",
      },
      {
        view: "TV wall",
        prompt:
          "Straight-on interior render of a west wall in a warm-contemporary living room: 55-inch TV wall-mounted above a 160cm low honey-oak console with flush fronts, a ceramic table lamp and a small framed abstract in muted terracotta. Soft-almond matte wall, brushed-brass picture light, warm 2700K. 35mm, camera height 140cm.",
      },
    ],
    notesForEngine:
      "Render the approved design only. Coffee table 95 cm and pendant at 168 cm AFF per the Director's resolution. Accent wall-wash sconces are phase 2 — omit from the primary render or show unlit.",
    onlyApprovedDecisions: true,
  };
}

const directorFixture: MockFixture = (ctx: MockContext) => {
  switch (ctx.schemaName) {
    case "director_intake":
      return intake;
    case "brief_compilation":
      return brief;
    case "director_synthesis":
      return synthesis;
    case "director_resolution":
      return resolution;
    case "director_presentation":
      return presentation;
    default:
      throw new Error(`No director fixture for schema "${ctx.schemaName}"`);
  }
};

export const defaultFixtures: Partial<Record<AgentId, MockFixture>> = {
  design_director: directorFixture,
  space_planner: () => layout,
  style_director: () => style,
  furniture_curator: () => furniture,
  material_specialist: () => materials,
  lighting_designer: () => lighting,
  budget_manager: () => budget,
  design_critic: () => review,
  visualizer: () => visualization(),
};
