import { z } from "zod/v4";
import {
  AgentId,
  Dimensions,
  InfoBasis,
  MoneyRange,
  Opening,
  PriorityCategory,
  RoomType,
} from "../domain.js";

/* --------------------------------------------------------------------------- *
 * Shared building blocks
 * --------------------------------------------------------------------------- */

/** An agent must separate what it was told from what it is guessing. */
export const Assumption = z.object({
  statement: z.string().describe("What is being assumed"),
  basis: InfoBasis,
  impactIfWrong: z.string().describe("What breaks in the design if this assumption is false"),
});
export type Assumption = z.infer<typeof Assumption>;

/** Raised by a specialist when its recommendation clashes with another agent's. */
export const Conflict = z.object({
  withAgent: AgentId,
  topic: z.string(),
  description: z.string(),
  thisAgentPosition: z.string(),
  priorityCategory: PriorityCategory.describe(
    "Which category in the priority hierarchy justifies this agent's position",
  ),
  proposedResolution: z.string(),
});
export type Conflict = z.infer<typeof Conflict>;

const SizeCm = z.object({
  widthCm: z.number().positive(),
  depthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
});

/* --------------------------------------------------------------------------- *
 * Design Director
 * --------------------------------------------------------------------------- */

export const DirectorIntake = z.object({
  understoodBrief: z.string().describe("Restate the user's brief in the Director's own words"),
  known: z.array(
    z.object({ field: z.string(), value: z.string(), basis: InfoBasis }),
  ),
  missingCritical: z
    .array(
      z.object({
        question: z.string().describe("A concise question to ask the user"),
        why: z.string(),
        blocksAgents: z.array(AgentId),
      }),
    )
    .describe("Only genuinely important questions — do not over-ask"),
  assumptionsIfUnanswered: z.array(Assumption),
  readyToProceed: z.boolean().describe("True if enough is known to build a project brief"),
});
export type DirectorIntake = z.infer<typeof DirectorIntake>;

export const BriefCompilation = z.object({
  title: z.string().describe("Short project title, e.g. 'Warm modern living room'"),
  roomType: RoomType,
  dimensions: Dimensions.optional(),
  openings: z.array(Opening),
  clientPreferences: z.object({
    stylePreferences: z.array(z.string()),
    colorPreferences: z.array(z.string()),
    materialPreferences: z.array(z.string()),
    dislikes: z.array(z.string()),
    functionalRequirements: z.array(z.string()),
    accessibilityNeeds: z.array(z.string()),
    householdSize: z.number().int().positive().optional(),
    hasChildren: z.boolean().optional(),
    hasPets: z.boolean().optional(),
    inspirationNotes: z.array(z.string()),
  }),
  existingFurnitureToKeep: z.array(z.string()),
  budgetTotal: z.number().nonnegative(),
  currency: z.string().default("USD"),
  architecturalNotes: z.array(z.string()),
  openQuestions: z.array(z.string()),
  assumptions: z.array(Assumption),
});
export type BriefCompilation = z.infer<typeof BriefCompilation>;

export const DirectorSynthesis = z.object({
  narrative: z.string().describe("The design story so far, in plain language"),
  chosenLayoutConcept: z.string().describe("Which Space Planner layout/alternative is being carried forward"),
  chosenStyleDirection: z.string(),
  detectedConflicts: z.array(
    z.object({
      id: z.string(),
      between: z.array(AgentId).min(2),
      topic: z.string(),
      description: z.string(),
      priorityCategory: PriorityCategory,
      resolution: z.string(),
      resolvedInFavorOf: z.union([AgentId, z.literal("compromise")]),
      actionsRequired: z.array(z.object({ agent: AgentId, change: z.string() })),
    }),
  ),
  revisionRequests: z.array(
    z.object({ agent: AgentId, instruction: z.string(), reason: z.string() }),
  ),
  openDecisionsForUser: z.array(z.string()),
  readyForCritic: z.boolean(),
});
export type DirectorSynthesis = z.infer<typeof DirectorSynthesis>;

export const DirectorResolution = z.object({
  addressedIssues: z.array(
    z.object({
      issueId: z.string(),
      resolution: z.string(),
      agentsToRerun: z.array(AgentId),
    }),
  ),
  unresolvedIssues: z.array(
    z.object({ issueId: z.string(), why: z.string(), needsUser: z.boolean() }),
  ),
  finalNarrative: z.string(),
  readyToFinalize: z.boolean(),
});
export type DirectorResolution = z.infer<typeof DirectorResolution>;

export const DirectorPresentation = z.object({
  headline: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  tradeoffsMade: z.array(z.string()),
  openWithUser: z.array(z.string()),
  nextSteps: z.array(z.string()),
});
export type DirectorPresentation = z.infer<typeof DirectorPresentation>;

/* --------------------------------------------------------------------------- *
 * Space Planner
 * --------------------------------------------------------------------------- */

export const LayoutProposal = z.object({
  room: RoomType,
  summary: z.string(),
  chosenConcept: z.string().describe("e.g. 'L-shaped seating arrangement'"),
  furniturePlacements: z.array(
    z.object({
      item: z.string(),
      approxSizeCm: SizeCm,
      position: z.string().describe("Where it sits in the room, relative to walls/openings"),
      facing: z.string().optional(),
      rationale: z.string(),
    }),
  ),
  circulation: z.array(
    z.object({ path: z.string(), minWidthCm: z.number().positive(), notes: z.string() }),
  ),
  clearances: z.array(
    z.object({
      between: z.string().describe("e.g. 'sofa front to coffee table'"),
      recommendedCm: z.number().positive(),
      notes: z.string(),
    }),
  ),
  spatialProblems: z.array(
    z.object({
      issue: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      priorityCategory: PriorityCategory,
      suggestedFix: z.string(),
    }),
  ),
  reasoning: z.string(),
  alternativeLayouts: z
    .array(
      z.object({
        name: z.string(),
        focus: z.string().describe("e.g. 'conversation-focused', 'TV-focused', 'open-plan'"),
        description: z.string(),
        tradeoffs: z.string(),
      }),
    )
    .min(2),
  fitsWithinRoom: z.boolean(),
  conflicts: z.array(Conflict),
  assumptions: z.array(Assumption),
});
export type LayoutProposal = z.infer<typeof LayoutProposal>;

/* --------------------------------------------------------------------------- *
 * Style Director
 * --------------------------------------------------------------------------- */

export const StyleDirection = z.object({
  primaryStyle: z.string(),
  secondaryStyle: z.string().optional(),
  visualDirection: z.string(),
  palette: z.array(
    z.object({
      name: z.string(),
      role: z.enum(["dominant", "secondary", "accent", "neutral"]),
      hex: z.string().optional(),
      notes: z.string(),
    }),
  ),
  materials: z.array(z.string()),
  textures: z.array(z.string()),
  shapes: z.array(z.string()),
  visualBalance: z.string(),
  styleCombinations: z.array(z.object({ name: z.string(), description: z.string() })),
  avoid: z.array(z.string()),
  rulesForOtherAgents: z.array(z.string()).describe("Hard visual rules the rest of the team must follow"),
  conflicts: z.array(Conflict),
  assumptions: z.array(Assumption),
});
export type StyleDirection = z.infer<typeof StyleDirection>;

/* --------------------------------------------------------------------------- *
 * Furniture Curator
 * --------------------------------------------------------------------------- */

export const FurniturePlan = z.object({
  items: z.array(
    z.object({
      item: z.string(),
      category: z.enum([
        "seating",
        "tables",
        "storage",
        "bed",
        "lighting",
        "rug",
        "decor",
        "other",
      ]),
      functionalPriority: z.enum(["essential", "recommended", "optional"]),
      recommendedSizeCm: z.object({
        widthMinCm: z.number().positive(),
        widthMaxCm: z.number().positive(),
        depthCm: z.number().positive().optional(),
        heightCm: z.number().positive().optional(),
      }),
      material: z.string(),
      color: z.string(),
      style: z.string(),
      quantity: z.number().int().positive(),
      budget: MoneyRange,
      reason: z.string(),
      respectsLayout: z.boolean().describe("Fits the Space Planner's dimensional requirements"),
      alternative: z
        .object({
          item: z.string(),
          whyDifferent: z.string(),
          budget: MoneyRange,
        })
        .nullable(),
    }),
  ),
  totalEstimate: MoneyRange,
  conflicts: z.array(Conflict),
  assumptions: z.array(Assumption),
});
export type FurniturePlan = z.infer<typeof FurniturePlan>;

/* --------------------------------------------------------------------------- *
 * Material Specialist
 * --------------------------------------------------------------------------- */

export const MaterialPalette = z.object({
  surfaces: z.array(
    z.object({
      surface: z.enum([
        "flooring",
        "walls",
        "ceiling",
        "trim",
        "countertop",
        "backsplash",
        "window_treatment",
        "rug",
        "hardware",
        "other",
      ]),
      material: z.string(),
      finish: z.string(),
      color: z.string(),
      durability: z.enum(["low", "medium", "high"]),
      maintenance: z.string(),
      estCost: MoneyRange,
      compatibilityNotes: z.string().describe("How it works with architecture, light, and style"),
    }),
  ),
  paletteSummary: z.string(),
  respectsExistingArchitecture: z.boolean(),
  conflicts: z.array(Conflict),
  assumptions: z.array(Assumption),
});
export type MaterialPalette = z.infer<typeof MaterialPalette>;

/* --------------------------------------------------------------------------- *
 * Lighting Designer
 * --------------------------------------------------------------------------- */

export const LightingPlan = z.object({
  ambient: z.string(),
  task: z.string(),
  accent: z.string(),
  decorative: z.string(),
  naturalLight: z.string(),
  fixtures: z.array(
    z.object({
      name: z.string(),
      layer: z.enum(["ambient", "task", "accent", "decorative"]),
      placement: z.string(),
      quantity: z.number().int().positive(),
      colorTempK: z.object({ min: z.number().positive(), max: z.number().positive() }),
      dimmable: z.boolean(),
      estCost: MoneyRange,
    }),
  ),
  colorTemperature: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    notes: z.string(),
  }),
  scenes: z
    .array(
      z.object({
        name: z.enum(["day", "evening", "night", "entertaining", "relaxing"]),
        description: z.string(),
        activeLayers: z.array(z.enum(["ambient", "task", "accent", "decorative"])),
      }),
    )
    .min(5),
  conflicts: z.array(Conflict),
  assumptions: z.array(Assumption),
});
export type LightingPlan = z.infer<typeof LightingPlan>;

/* --------------------------------------------------------------------------- *
 * Budget Manager
 * --------------------------------------------------------------------------- */

export const BudgetEstimate = z.object({
  currency: z.string().default("USD"),
  lineItems: z.array(
    z.object({
      category: z.enum([
        "furniture",
        "materials",
        "lighting",
        "decor",
        "installation",
        "contingency",
        "other",
      ]),
      label: z.string(),
      amount: z.number().nonnegative(),
      basis: InfoBasis,
    }),
  ),
  categoryTotals: z.array(
    z.object({ category: z.string(), amount: z.number().nonnegative() }),
  ),
  estimatedTotal: z.number().nonnegative(),
  userBudget: z.number().nonnegative(),
  remaining: z.number().describe("userBudget - estimatedTotal; may be negative"),
  overBudget: z.boolean(),
  overrunAnalysis: z
    .string()
    .describe("If over budget: highest-impact reductions that preserve the concept. Else: headroom notes."),
  savingOpportunities: z.array(
    z.object({
      area: z.string(),
      action: z.string(),
      estSaving: z.number().nonnegative(),
      conceptImpact: z.enum(["none", "low", "medium"]),
    }),
  ),
  tiers: z
    .array(
      z.object({
        name: z.enum(["essential", "balanced", "elevated"]),
        total: z.number().nonnegative(),
        description: z.string(),
      }),
    )
    .min(1),
  assumptions: z.array(Assumption),
});
export type BudgetEstimate = z.infer<typeof BudgetEstimate>;

/* --------------------------------------------------------------------------- *
 * Design Critic
 * --------------------------------------------------------------------------- */

const Score = z.number().min(0).max(10);

export const DesignReview = z.object({
  scores: z.object({
    functionality: Score,
    styleConsistency: Score,
    budget: Score,
    spatialEfficiency: Score,
    lighting: Score,
  }),
  overall: Score,
  issues: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      category: PriorityCategory,
      severity: z.enum(["critical", "major", "minor"]),
      affects: z.array(AgentId),
      recommendedRevision: z.string(),
    }),
  ),
  missingInformation: z.array(z.string()),
  styleConflicts: z.array(z.string()),
  verdict: z.enum(["approve", "revise", "blocked"]),
  summary: z.string(),
});
export type DesignReview = z.infer<typeof DesignReview>;

/* --------------------------------------------------------------------------- *
 * Visualizer
 * --------------------------------------------------------------------------- */

export const VisualizationSpec = z.object({
  sceneSummary: z.string(),
  cameraAngles: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      lensMm: z.number().positive().optional(),
      heightCm: z.number().positive(),
    }),
  ),
  lightingConditions: z.array(
    z.object({ scene: z.string(), description: z.string() }),
  ),
  materialCallouts: z.array(
    z.object({ surface: z.string(), material: z.string(), finish: z.string() }),
  ),
  keyProps: z.array(z.string()),
  beforeAfter: z.object({ before: z.string(), after: z.string() }),
  renderPrompts: z.array(
    z.object({
      view: z.string(),
      prompt: z.string(),
      negativePrompt: z.string().optional(),
    }),
  ),
  notesForEngine: z.string(),
  onlyApprovedDecisions: z
    .boolean()
    .describe("Must be true — the Visualizer only renders decisions already approved"),
});
export type VisualizationSpec = z.infer<typeof VisualizationSpec>;
