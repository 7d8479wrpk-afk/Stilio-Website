import type { z } from "zod/v4";
import { AGENT_LABELS, type AgentId } from "../domain.js";
import type { Effort, LLMClient } from "../llm/types.js";
import type { ProjectMemory } from "../memory/project-memory.js";
import { renderProjectContext } from "./context.js";
import {
  BriefCompilation,
  DirectorIntake,
  DirectorPresentation,
  DirectorResolution,
  DirectorSynthesis,
} from "./schemas.js";

const ROLE = `
You are the DESIGN DIRECTOR — the client's single point of contact and the owner of the
overall design vision. The client talks to you, not to the specialists.

You do NOT make every specialist decision yourself. You:
- Understand the brief: room type, dimensions, style, function, budget, materials, colour.
- Ask only the important missing questions.
- Decide which specialists to involve and what to ask them.
- Combine specialist outputs into one coherent direction.
- Detect conflicts between specialists and resolve them by the priority hierarchy:
  safety/building code > physical feasibility > user requirement > functionality >
  budget > style > aesthetic preference.
- Send revision requests when a specialist's output is infeasible or off-brief.
- Never overwrite an APPROVED decision without the user's permission.
- Present the final recommendation to the user in plain language.
`.trim();

export interface DirectorCallMeta {
  usage: { inputTokens: number; outputTokens: number };
  backend: "anthropic" | "mock";
  attempts: number;
}

export class DesignDirector {
  readonly id = "design_director" as const;
  readonly label = AGENT_LABELS.design_director;
  private effort: Effort = "high";

  constructor(private readonly llm: LLMClient) {}

  private async call<T>(
    memory: ProjectMemory,
    schema: z.ZodType<T>,
    schemaName: string,
    prompt: string,
    logTask: string,
  ): Promise<{ data: T; meta: DirectorCallMeta }> {
    memory.logExchange({
      from: "design_director",
      to: "design_director",
      kind: "note",
      task: logTask,
      summary: `Director: ${logTask}`,
      payload: null,
    });
    const result = await this.llm.generateStructured<T>({
      agent: "design_director",
      system: ROLE,
      prompt,
      schema,
      schemaName,
      schemaDescription: "Design Director structured output",
      effort: this.effort,
    });
    return {
      data: result.data,
      meta: {
        usage: { inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens },
        backend: result.backend,
        attempts: result.attempts,
      },
    };
  }

  /** Step 1 — understand the brief and find critical gaps. */
  intake(memory: ProjectMemory, userMessage: string) {
    return this.call(
      memory,
      DirectorIntake,
      "director_intake",
      `
The user said:
"""
${userMessage}
"""

${renderProjectContext(memory)}

TASK: Produce a "director_intake".
- Restate what you understood.
- List what is known and whether each fact is confirmed or assumed.
- List ONLY the critical missing questions (max ~6). Skip anything you can reasonably
  assume. For each, say which specialist agents it blocks.
- readyToProceed is true only if a specialist team could start without those answers.
`.trim(),
      "intake",
    );
  }

  /** Step 2 — compile the confirmed brief from the user's answers. */
  compileBrief(
    memory: ProjectMemory,
    userMessage: string,
    answers: Record<string, string>,
  ) {
    const answerText =
      Object.keys(answers).length > 0
        ? Object.entries(answers)
            .map(([q, a]) => `Q: ${q}\nA: ${a}`)
            .join("\n\n")
        : "(no additional answers provided — assume sensible defaults and record them)";
    return this.call(
      memory,
      BriefCompilation,
      "brief_compilation",
      `
Original brief:
"""
${userMessage}
"""

Answers to your questions:
"""
${answerText}
"""

${renderProjectContext(memory)}

TASK: Produce a "brief_compilation" — the single source of truth the specialists build on.
- Fill every field. Where you are guessing, put it in "assumptions" with its basis.
- openQuestions holds anything still unconfirmed but non-blocking.
`.trim(),
      "compile-brief",
    );
  }

  /** Step 3 — combine specialist outputs, detect + resolve conflicts. */
  synthesize(memory: ProjectMemory) {
    return this.call(
      memory,
      DirectorSynthesis,
      "director_synthesis",
      `
${renderProjectContext(memory)}

The specialists (Space Planner, Style Director, Furniture Curator, Material Specialist,
Lighting Designer, Budget Manager) have reported. Their outputs are in the context above,
including any "conflicts" arrays they raised.

TASK: Produce a "director_synthesis".
- Choose which layout concept and style direction to carry forward.
- Detect every conflict between specialists (including ones they did not self-report).
- Resolve each using the priority hierarchy; say who it was resolved in favour of and
  what each affected agent must change.
- List revision requests (agent + instruction + reason).
- List decisions that genuinely need the user (openDecisionsForUser).
- readyForCritic is true only once conflicts have a resolution path.
`.trim(),
      "synthesize",
    );
  }

  /** Step 4 — turn the Critic's review into an action plan. */
  resolveReview(memory: ProjectMemory) {
    return this.call(
      memory,
      DirectorResolution,
      "director_resolution",
      `
${renderProjectContext(memory)}

The Design Critic has reviewed the proposal (see DESIGN REVIEW above).

TASK: Produce a "director_resolution".
- For every critical and major issue, give a concrete resolution and which agents to re-run.
- unresolvedIssues holds anything you cannot resolve without the user (needsUser=true)
  or that is acceptable to defer (needsUser=false, with why).
- readyToFinalize is true only if no critical issue remains open.
`.trim(),
      "resolve-review",
    );
  }

  /** Step 5 — present the final design to the user. */
  present(memory: ProjectMemory) {
    return this.call(
      memory,
      DirectorPresentation,
      "director_presentation",
      `
${renderProjectContext(memory)}

The design is complete and the visualization spec is ready.

TASK: Produce a "director_presentation" — how you would hand this to the client.
- Plain language. Lead with the concept, then the highlights, then the trade-offs made,
  then anything still open, then next steps.
`.trim(),
      "present",
    );
  }
}

export const DIRECTOR_TARGETS: readonly AgentId[] = [
  "space_planner",
  "style_director",
  "furniture_curator",
  "material_specialist",
  "lighting_designer",
  "budget_manager",
  "design_critic",
  "visualizer",
];
