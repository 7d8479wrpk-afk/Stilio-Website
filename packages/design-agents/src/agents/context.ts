import type { ProjectMemory } from "../memory/project-memory.js";
import { AGENT_LABELS } from "../domain.js";

/**
 * Compact, prompt-friendly serialization of the shared memory.
 * Every specialist agent receives this so it works from the same facts.
 */
export function renderProjectContext(
  memory: ProjectMemory,
  opts: { include?: Array<keyof ReturnType<ProjectMemory["toJSON"]>>; } = {},
): string {
  const data = memory.toJSON();
  const sections: string[] = [];

  sections.push(`PROJECT: ${data.title} (${data.projectId}) — status: ${data.status}`);

  const briefBlock = data.brief
    ? json(data.brief)
    : json({
        roomInformation: data.roomInformation,
        dimensions: data.dimensions,
        architecturalConstraints: data.architecturalConstraints,
        clientPreferences: data.clientPreferences,
        budgetContext: data.budgetContext,
      });
  sections.push(`--- BRIEF / CONTEXT ---\n${briefBlock}`);

  const produced: Array<[string, unknown]> = [
    ["STYLE DIRECTION", data.styleDirection],
    ["LAYOUT", data.layout],
    ["FURNITURE", data.furniture],
    ["MATERIALS", data.materials],
    ["LIGHTING", data.lighting],
    ["BUDGET", data.budget],
    ["DESIGN REVIEW", data.review],
  ];
  for (const [label, value] of produced) {
    if (value && (!opts.include || true)) {
      sections.push(`--- ${label} (already decided by another agent) ---\n${json(value)}`);
    }
  }

  if (memory.approvedDecisions.length > 0) {
    const lines = memory.approvedDecisions
      .map(
        (d) =>
          `• [${d.topic}] ${d.description} — approved (by ${AGENT_LABELS[d.madeBy]}, basis: ${d.basis})`,
      )
      .join("\n");
    sections.push(
      `--- APPROVED DECISIONS (LOCKED — respect these, never contradict or silently change them) ---\n${lines}`,
    );
  }

  if (data.openQuestions.length > 0) {
    sections.push(`--- OPEN QUESTIONS ---\n${data.openQuestions.map((q) => `• ${q}`).join("\n")}`);
  }

  return sections.join("\n\n");
}

function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
