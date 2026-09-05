import { now } from "../util/ids.js";
import type { ProjectMemory } from "../memory/project-memory.js";
import { FinalDesignSpecification } from "./schema.js";

/**
 * Assemble the final design specification from approved project memory.
 * Deterministic — no LLM. Missing sections are left null so the caller/3D engine
 * can see exactly what is and isn't decided.
 */
export function assembleFinalSpec(
  memory: ProjectMemory,
  opts: { designRationale?: string; decor?: string[] } = {},
): FinalDesignSpecification {
  const data = memory.toJSON();
  const style = data.styleDirection;
  const latestVersion = data.designVersions.at(-1);

  const spec = {
    specVersion: "1.0" as const,
    project: {
      id: data.projectId,
      title: data.title,
      generatedAt: now(),
      designVersion: latestVersion?.number ?? 1,
    },
    room: {
      type: data.roomInformation.roomType,
      location: data.roomInformation.location ?? null,
      orientationNotes: data.roomInformation.orientationNotes ?? null,
    },
    dimensions: data.dimensions,
    designStyle: {
      primary: style?.primaryStyle ?? "undecided",
      secondary: style?.secondaryStyle ?? null,
      visualDirection: style?.visualDirection ?? "",
      rules: style?.rulesForOtherAgents ?? [],
      avoid: style?.avoid ?? [],
    },
    colorPalette: (style?.palette ?? []).map((c) => ({
      name: c.name,
      role: c.role,
      hex: c.hex ?? null,
      notes: c.notes,
    })),
    layout: data.layout,
    furniture: data.furniture,
    materials: data.materials,
    lighting: data.lighting,
    decor: opts.decor ?? [],
    budget: data.budget,
    designRationale:
      opts.designRationale ??
      data.designVersions.at(-1)?.styleSummary ??
      style?.visualDirection ??
      "",
    visualizationInstructions: data.visualization,
    approvedDecisions: memory.approvedDecisions.map((d) => ({
      topic: d.topic,
      description: d.description,
      madeBy: d.madeBy,
      basis: d.basis,
      rationale: d.rationale,
    })),
    openItems: data.openQuestions,
  };

  return FinalDesignSpecification.parse(spec);
}
