import type { PhotoKey } from "@/lib/photography";

export interface Service {
  slug: string;
  /** Short name for nav / cards. */
  name: string;
  /** <title> — primary keyword led. */
  title: string;
  /** <h1>. */
  heading: string;
  /** One-line summary for the index card and meta description. */
  summary: string;
  /** 2–3 body paragraphs. */
  body: string[];
  /** Bullet list of what the service covers. */
  includes: string[];
  photo: PhotoKey;
  /** Project slugs that best demonstrate this service. */
  projects: string[];
}

export const services: Service[] = [
  {
    slug: "interior-design",
    name: "Interior Design",
    title: "Interior Design Services in Amman | Stilio",
    heading: "Interior design",
    summary:
      "Spatial planning, joinery, furniture and styling — a complete residential or workplace scheme, drawn and documented.",
    body: [
      "Interior design at Stilio starts with how a space works before how it looks. We re-plan circulation, sightlines and storage, then set a visual direction: the material palette, the proportions, and the one considered accent. Nothing is chosen to impress — everything is chosen for a reason.",
      "The output is a full set of drawings and specifications: layouts, elevations, joinery details, a furniture and finishes schedule, and a lighting design. You see the whole scheme in an interactive 3D model before a single decision is committed.",
      "We work on homes and workplaces across Jordan and beyond, from a single room to a whole-property fit-out. The same team that plans the space specifies its materials and stays on site while it is built.",
    ],
    includes: [
      "Spatial planning and space re-planning",
      "Concept and visual direction",
      "Joinery and built-in detailing",
      "Furniture, art and styling curation",
      "Full documentation and finishes schedule",
      "An interactive 3D model of the scheme",
    ],
    photo: "livingPenthouseWarm",
    projects: ["maison-archives", "north-light-house", "gallery-apartment"],
  },
  {
    slug: "renovation",
    name: "Renovation",
    title: "Home & Apartment Renovation in Amman | Stilio",
    heading: "Renovation",
    summary:
      "Structural changes, services, finishes and site management — the drawings and the programme, held together by one team.",
    body: [
      "A renovation is only as good as its coordination. Stilio holds the design drawings, the trades and the programme in one place, so the room that gets built is the room that was designed — not a diluted version of it.",
      "We handle structural changes, re-planned services, new finishes and the day-to-day of the site: trades, samples, snags and sequencing. Because the people who designed the scheme are the people on site, decisions are made quickly and consistently.",
      "Typical work ranges from a full apartment strip-out and rebuild to a targeted kitchen, bathroom or whole-floor renovation. Scope, programme and budget are agreed before any work begins.",
    ],
    includes: [
      "Structural alterations and layout changes",
      "Re-planned electrical, plumbing and HVAC routing",
      "Finishes, joinery and fit-out",
      "Trades coordination and site management",
      "Samples, snagging and handover",
      "A single point of contact from brief to completion",
    ],
    photo: "kitchenWalnutBlackHood",
    projects: ["maison-archives", "travertine-penthouse", "bronze-hall-residence"],
  },
  {
    slug: "material-lighting-design",
    name: "Material & Lighting Design",
    title: "Material & Lighting Design for Interiors | Stilio",
    heading: "Material & lighting design",
    summary:
      "A resolved palette of stone, timber and textile, and a four-layer lighting design tuned scene by scene.",
    body: [
      "Every Stilio scheme is built from a short list of honest materials — rift-sawn oak, honed stone, natural linen, brushed brass — chosen for how they age as much as how they look on day one. We resolve the palette as a whole: what each surface is, how it meets the next, and how it behaves in warm light.",
      "Lighting is designed in four layers — ambient, task, accent and decorative — and tuned for morning, evening and night. The aim is a room that changes character through the day without a single fixture doing the obvious work.",
      "Material and lighting design can run as part of a full interior project or as a standalone piece of work for an architect or another studio.",
    ],
    includes: [
      "A coordinated material and finishes palette",
      "Sample boards and physical specification",
      "Four-layer lighting design",
      "Fixture selection and circuiting / scene setting",
      "Colour-temperature and dimming strategy",
      "Specification an architect or contractor can build from",
    ],
    photo: "livingMarbleLounge",
    projects: ["travertine-penthouse", "north-light-house", "stone-stair-villa"],
  },
  {
    slug: "3d-visualisation",
    name: "3D Visualisation",
    title: "3D Interior Visualisation & Rendering | Stilio",
    heading: "3D interior visualisation",
    summary:
      "Every scheme modelled before a wall moves — so you walk the room, in the right light, before you commit.",
    body: [
      "Stilio models every project in 3D as part of the design process, not as an add-on. You don't approve a mood board and hope — you walk the actual room, at the right time of day, with the real materials on the real surfaces.",
      "The model is how the specification is read: change the palette, the lighting state or a single piece of furniture and see the consequence immediately. It removes the guesswork from the biggest decisions before any money is spent on site.",
      "Visualisation is included in every full design engagement, and is available as a standalone service for developers and other studios who need a scheme rendered accurately.",
    ],
    includes: [
      "A navigable 3D model of the scheme",
      "Photoreal stills in day, evening and night states",
      "Material and furniture options shown in place",
      "Revisions through the design development stage",
      "Assets for client and stakeholder sign-off",
    ],
    photo: "livingMediaWallCity",
    projects: ["maison-archives", "gallery-apartment", "atelier-nord"],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
