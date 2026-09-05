import { z } from "zod/v4";
import { AgentId, Dimensions, InfoBasis, Opening, RoomType } from "../domain.js";
import {
  BriefCompilation,
  BudgetEstimate,
  DesignReview,
  FurniturePlan,
  LayoutProposal,
  LightingPlan,
  MaterialPalette,
  StyleDirection,
  VisualizationSpec,
} from "../agents/schemas.js";

/* --------------------------------------------------------------------------- *
 * Decisions — the ledger every agent reads and never silently overwrites.
 * --------------------------------------------------------------------------- */

export const DecisionStatus = z.enum(["proposed", "approved", "rejected"]);
export type DecisionStatus = z.infer<typeof DecisionStatus>;

export const Decision = z.object({
  id: z.string(),
  topic: z.string().describe("Short key, e.g. 'flooring', 'sofa-size', 'palette'"),
  description: z.string(),
  madeBy: AgentId,
  basis: InfoBasis,
  status: DecisionStatus,
  rationale: z.string(),
  /** Id of a decision this one replaces (kept for history, never deleted). */
  supersedes: z.string().nullable().default(null),
  tags: z.array(z.string()).default(() => []),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Decision = z.infer<typeof Decision>;

/* --------------------------------------------------------------------------- *
 * Versions — every major design shift is snapshotted and restorable.
 * --------------------------------------------------------------------------- */

export const DesignVersion = z.object({
  id: z.string(),
  number: z.number().int().positive(),
  label: z.string().describe("e.g. 'Warm Modern', 'Warm Modern + Japandi'"),
  styleSummary: z.string(),
  reason: z.string(),
  createdAt: z.string(),
  /** Full serialized project core at snapshot time (see ProjectCore). */
  snapshot: z.unknown(),
});
export type DesignVersion = z.infer<typeof DesignVersion>;

/* --------------------------------------------------------------------------- *
 * Agent conversations — structured message log (section 11).
 * --------------------------------------------------------------------------- */

export const AgentExchange = z.object({
  id: z.string(),
  at: z.string(),
  from: AgentId,
  to: AgentId,
  kind: z.enum(["task", "result", "revision", "conflict", "note"]),
  task: z.string(),
  summary: z.string(),
  payload: z.unknown(),
});
export type AgentExchange = z.infer<typeof AgentExchange>;

/* --------------------------------------------------------------------------- *
 * Client + room context
 * --------------------------------------------------------------------------- */

export const ClientPreferences = z.object({
  stylePreferences: z.array(z.string()).default(() => []),
  colorPreferences: z.array(z.string()).default(() => []),
  materialPreferences: z.array(z.string()).default(() => []),
  dislikes: z.array(z.string()).default(() => []),
  functionalRequirements: z.array(z.string()).default(() => []),
  accessibilityNeeds: z.array(z.string()).default(() => []),
  householdSize: z.number().int().positive().optional(),
  hasChildren: z.boolean().optional(),
  hasPets: z.boolean().optional(),
  inspirationNotes: z.array(z.string()).default(() => []),
});
export type ClientPreferences = z.infer<typeof ClientPreferences>;

export const RoomInformation = z.object({
  roomType: RoomType.default("other"),
  location: z.string().optional(),
  orientationNotes: z.string().optional(),
  existingFurnitureToKeep: z.array(z.string()).default(() => []),
});
export type RoomInformation = z.infer<typeof RoomInformation>;

export const ArchitecturalConstraints = z.object({
  openings: z.array(Opening).default(() => []),
  features: z.array(z.string()).default(() => []),
  notes: z.array(z.string()).default(() => []),
});
export type ArchitecturalConstraints = z.infer<typeof ArchitecturalConstraints>;

export const BudgetContext = z.object({
  currency: z.string().default("USD"),
  total: z.number().nonnegative().default(0),
  notes: z.array(z.string()).default(() => []),
});
export type BudgetContext = z.infer<typeof BudgetContext>;

/* --------------------------------------------------------------------------- *
 * The full project memory object
 * --------------------------------------------------------------------------- */

export const ProjectStatus = z.enum([
  "intake",
  "briefing",
  "designing",
  "reviewing",
  "finalized",
]);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

/** The parts of memory that get snapshotted into a DesignVersion. */
export const ProjectCore = z.object({
  clientPreferences: ClientPreferences.prefault({}),
  roomInformation: RoomInformation.prefault({}),
  dimensions: Dimensions.nullable().default(null),
  architecturalConstraints: ArchitecturalConstraints.prefault({}),
  budgetContext: BudgetContext.prefault({}),
  brief: BriefCompilation.nullable().default(null),
  styleDirection: StyleDirection.nullable().default(null),
  layout: LayoutProposal.nullable().default(null),
  furniture: FurniturePlan.nullable().default(null),
  materials: MaterialPalette.nullable().default(null),
  lighting: LightingPlan.nullable().default(null),
  budget: BudgetEstimate.nullable().default(null),
  review: DesignReview.nullable().default(null),
  visualization: VisualizationSpec.nullable().default(null),
});
export type ProjectCore = z.infer<typeof ProjectCore>;

export const ProjectMemory = ProjectCore.extend({
  projectId: z.string(),
  title: z.string().default("Untitled project"),
  status: ProjectStatus.default("intake"),
  createdAt: z.string(),
  updatedAt: z.string(),
  decisions: z.array(Decision).default(() => []),
  designVersions: z.array(DesignVersion).default(() => []),
  agentConversations: z.array(AgentExchange).default(() => []),
  openQuestions: z.array(z.string()).default(() => []),
});
export type ProjectMemory = z.infer<typeof ProjectMemory>;

export const CORE_KEYS = [
  "clientPreferences",
  "roomInformation",
  "dimensions",
  "architecturalConstraints",
  "budgetContext",
  "brief",
  "styleDirection",
  "layout",
  "furniture",
  "materials",
  "lighting",
  "budget",
  "review",
  "visualization",
] as const satisfies readonly (keyof ProjectCore)[];
