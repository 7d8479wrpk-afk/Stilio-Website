import { z } from "zod/v4";
import { Dimensions, RoomType } from "../domain.js";
import {
  BudgetEstimate,
  FurniturePlan,
  LayoutProposal,
  LightingPlan,
  MaterialPalette,
  StyleDirection,
  VisualizationSpec,
} from "../agents/schemas.js";

/**
 * The single structured object the Design Director produces once the design is
 * approved (brief section 17). This is what the future 3D engine will consume —
 * it is assembled deterministically from approved project memory, not generated.
 */
export const FinalDesignSpecification = z.object({
  specVersion: z.literal("1.0"),
  project: z.object({
    id: z.string(),
    title: z.string(),
    generatedAt: z.string(),
    designVersion: z.number().int().positive(),
  }),
  room: z.object({
    type: RoomType,
    location: z.string().nullable(),
    orientationNotes: z.string().nullable(),
  }),
  dimensions: Dimensions.nullable(),
  designStyle: z.object({
    primary: z.string(),
    secondary: z.string().nullable(),
    visualDirection: z.string(),
    rules: z.array(z.string()),
    avoid: z.array(z.string()),
  }),
  colorPalette: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      hex: z.string().nullable(),
      notes: z.string(),
    }),
  ),
  layout: LayoutProposal.nullable(),
  furniture: FurniturePlan.nullable(),
  materials: MaterialPalette.nullable(),
  lighting: LightingPlan.nullable(),
  decor: z.array(z.string()),
  budget: BudgetEstimate.nullable(),
  designRationale: z.string(),
  visualizationInstructions: VisualizationSpec.nullable(),
  approvedDecisions: z.array(
    z.object({
      topic: z.string(),
      description: z.string(),
      madeBy: z.string(),
      basis: z.string(),
      rationale: z.string(),
    }),
  ),
  openItems: z.array(z.string()),
});
export type FinalDesignSpecification = z.infer<typeof FinalDesignSpecification>;
