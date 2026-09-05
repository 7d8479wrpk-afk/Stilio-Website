import { BaseAgent, type AgentRunContext } from "./base-agent.js";
import { renderProjectContext } from "./context.js";
import { StyleDirection } from "./schemas.js";

export class StyleDirector extends BaseAgent<StyleDirection> {
  readonly id = "style_director" as const;
  readonly schemaName = "style_direction";
  readonly outputSchema = StyleDirection;

  protected role(): string {
    return `
You are the STYLE DIRECTOR on an interior design team. You define the visual identity
of the project and the visual rules the rest of the team must follow.

Your job:
- Identify the preferred design style from the user's words, dislikes, and inspiration.
- Define a clear visual direction: primary style, optional secondary style.
- Recommend a colour palette (with roles), materials, textures, shapes, and visual balance.
- List what to AVOID.
- Produce "rulesForOtherAgents": concrete, testable visual constraints
  (e.g. "no glossy finishes", "wood tones warm, never grey-washed",
  "max one black accent per surface").

Translate soft language into decisions. If the user says "modern but not cold",
resolve that into warm modern / organic modern with warm neutrals and natural wood,
and explicitly avoid cold greys, high-gloss, and heavy industrial elements.
`.trim();
  }

  protected composePrompt(ctx: AgentRunContext): string {
    return `
${ctx.task.instruction}

${renderProjectContext(ctx.memory)}

TASK: Produce a "style_direction".
- Anchor the palette and materials to the room's architecture, light, and budget tier.
- Keep the rules concrete enough that the Furniture Curator, Material Specialist, and
  Lighting Designer can check their work against them.
- Record anything you inferred (rather than were told) in "assumptions".
`.trim();
  }

  protected override summarize(data: StyleDirection): string {
    const secondary = data.secondaryStyle ? ` + ${data.secondaryStyle}` : "";
    return `Style Director: ${data.primaryStyle}${secondary}; ${data.palette.length} palette colours; ${data.rulesForOtherAgents.length} rule(s).`;
  }
}
