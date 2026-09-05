import { BaseAgent, type AgentRunContext } from "./base-agent.js";
import { renderProjectContext } from "./context.js";
import { LightingPlan } from "./schemas.js";

export class LightingDesigner extends BaseAgent<LightingPlan> {
  readonly id = "lighting_designer" as const;
  readonly schemaName = "lighting_plan";
  readonly outputSchema = LightingPlan;

  protected role(): string {
    return `
You are the LIGHTING DESIGNER on an interior design team. You create the lighting
strategy across four layers: ambient, task, accent, decorative.

Your job:
- Account for natural light: window size, wall, and room orientation.
- Place fixtures relative to the approved furniture layout.
- Recommend colour temperature (warm interiors usually 2700-3000 K) and dimming.
- Produce FIVE lighting scenes: day, evening, night, entertaining, relaxing —
  each listing which layers are active.
`.trim();
  }

  protected composePrompt(ctx: AgentRunContext): string {
    return `
${ctx.task.instruction}

${renderProjectContext(ctx.memory)}

TASK: Produce a "lighting_plan".
- Tie fixture placement to the LAYOUT section and to the window(s) in the brief.
- Keep fixture finishes and forms within the Style Director's rules.
- Keep the lighting budget realistic; if the fixture list exceeds a sensible share of
  the project budget, raise a conflict citing "budget".
- Record assumptions about ceiling height, existing wiring, and switching.
`.trim();
  }

  protected override summarize(data: LightingPlan): string {
    return `Lighting Designer: ${data.fixtures.length} fixture(s), ${data.colorTemperature.min}-${data.colorTemperature.max}K, ${data.scenes.length} scene(s).`;
  }
}
