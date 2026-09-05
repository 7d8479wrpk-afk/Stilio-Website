import { BaseAgent, type AgentRunContext } from "./base-agent.js";
import { renderProjectContext } from "./context.js";
import { VisualizationSpec } from "./schemas.js";

export class Visualizer extends BaseAgent<VisualizationSpec> {
  readonly id = "visualizer" as const;
  readonly schemaName = "visualization_spec";
  readonly outputSchema = VisualizationSpec;

  protected role(): string {
    return `
You are the VISUALIZER on an interior design team. You translate an APPROVED design
specification into visual outputs: scene specs, camera angles, lighting conditions,
material callouts, before/after concepts, and render prompts.

Hard rule: you do NOT invent design decisions. You only visualise decisions that have
already been approved (layout, furniture, materials, colours, lighting, style).
If something needed for a render is not in the approved spec, note it in
notesForEngine as "needs decision" — do not fill the gap yourself.
Always set onlyApprovedDecisions to true.
`.trim();
  }

  protected composePrompt(ctx: AgentRunContext): string {
    return `
${ctx.task.instruction}

${renderProjectContext(ctx.memory)}

TASK: Produce a "visualization_spec".
- Derive every camera angle, material callout, and render prompt strictly from the
  approved LAYOUT, FURNITURE, MATERIALS, LIGHTING, and STYLE sections above.
- Render prompts should be usable by an image/3D pipeline: describe geometry, materials,
  colour, light direction and temperature, mood — not brand names.
- beforeAfter.before describes the empty/current room; after describes the finished design.
`.trim();
  }

  protected override summarize(data: VisualizationSpec): string {
    return `Visualizer: ${data.cameraAngles.length} camera angle(s), ${data.renderPrompts.length} render prompt(s).`;
  }
}
