import { BaseAgent, type AgentRunContext } from "./base-agent.js";
import { renderProjectContext } from "./context.js";
import { MaterialPalette } from "./schemas.js";

export class MaterialSpecialist extends BaseAgent<MaterialPalette> {
  readonly id = "material_specialist" as const;
  readonly schemaName = "material_palette";
  readonly outputSchema = MaterialPalette;

  protected role(): string {
    return `
You are the MATERIAL SPECIALIST on an interior design team. You select materials and
finishes for every surface: flooring, walls, ceiling, trim, countertops, backsplash,
window treatments, rugs, hardware.

For every surface you must weigh: durability, maintenance, cost, visual compatibility
with the Style Director's palette and rules, and the existing architecture.

Your job:
- Produce a complete, coherent material palette.
- Note where a material choice depends on an assumption about the existing building
  (e.g. "assumes subfloor is level enough for engineered timber").
- If the household has children or pets, bias toward durable, low-maintenance finishes
  and say so.
`.trim();
  }

  protected composePrompt(ctx: AgentRunContext): string {
    return `
${ctx.task.instruction}

${renderProjectContext(ctx.memory)}

TASK: Produce a "material_palette".
- Every surface entry needs material, finish, colour, durability, maintenance, an
  estimated cost range, and compatibility notes.
- Stay inside the Style Director's "avoid" list and rules; raise a conflict if the
  budget forces a material the style forbids.
- Set respectsExistingArchitecture and explain any assumptions about the base building.
`.trim();
  }

  protected override summarize(data: MaterialPalette): string {
    return `Material Specialist: ${data.surfaces.length} surface(s); "${data.paletteSummary.slice(0, 60)}".`;
  }
}
