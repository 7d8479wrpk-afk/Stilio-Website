import { z } from "zod/v4";

/**
 * Shared domain vocabulary for the interior-design agent system.
 * These types are used across project memory, agent messages, and the final spec.
 */

export const Wall = z.enum(["north", "south", "east", "west"]);
export type Wall = z.infer<typeof Wall>;

export const RoomType = z.enum([
  "living_room",
  "bedroom",
  "kitchen",
  "dining_room",
  "home_office",
  "bathroom",
  "kids_room",
  "hallway",
  "studio",
  "other",
]);
export type RoomType = z.infer<typeof RoomType>;

/** How solid a piece of information is. Agents must never present an assumption as confirmed. */
export const InfoBasis = z.enum(["confirmed", "assumed", "inferred"]);
export type InfoBasis = z.infer<typeof InfoBasis>;

export const Dimensions = z.object({
  lengthM: z.number().positive().describe("Longer floor dimension, metres"),
  widthM: z.number().positive().describe("Shorter floor dimension, metres"),
  heightM: z.number().positive().optional().describe("Ceiling height, metres"),
});
export type Dimensions = z.infer<typeof Dimensions>;

export const Opening = z.object({
  type: z.enum(["door", "window", "opening", "sliding_door"]),
  wall: Wall,
  widthM: z.number().positive(),
  heightM: z.number().positive().optional(),
  offsetFromCornerM: z.number().nonnegative().optional(),
  swing: z.enum(["in", "out", "slide", "none"]).optional(),
  notes: z.string().optional(),
});
export type Opening = z.infer<typeof Opening>;

export const Money = z.object({
  currency: z.string().default("USD"),
  amount: z.number().nonnegative(),
});
export type Money = z.infer<typeof Money>;

export const MoneyRange = z.object({
  currency: z.string().default("USD"),
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
});
export type MoneyRange = z.infer<typeof MoneyRange>;

/**
 * The conflict-resolution hierarchy from the brief (section 15).
 * Lower number = higher priority. The Design Director resolves disagreements
 * by comparing the priority of each side's justification.
 */
export const PriorityCategory = z.enum([
  "safety_building_code", // 1
  "physical_feasibility", // 2
  "user_requirement", // 3
  "functionality", // 4
  "budget", // 5
  "style", // 6
  "aesthetic_preference", // 7
]);
export type PriorityCategory = z.infer<typeof PriorityCategory>;

export const PRIORITY_ORDER: Record<PriorityCategory, number> = {
  safety_building_code: 1,
  physical_feasibility: 2,
  user_requirement: 3,
  functionality: 4,
  budget: 5,
  style: 6,
  aesthetic_preference: 7,
};

export const AGENT_IDS = [
  "design_director",
  "space_planner",
  "style_director",
  "furniture_curator",
  "material_specialist",
  "lighting_designer",
  "budget_manager",
  "design_critic",
  "visualizer",
] as const;

export const AgentId = z.enum(AGENT_IDS);
export type AgentId = z.infer<typeof AgentId>;

export const AGENT_LABELS: Record<AgentId, string> = {
  design_director: "Design Director",
  space_planner: "Space Planner",
  style_director: "Style Director",
  furniture_curator: "Furniture Curator",
  material_specialist: "Material Specialist",
  lighting_designer: "Lighting Designer",
  budget_manager: "Budget Manager",
  design_critic: "Design Critic",
  visualizer: "Visualizer",
};
